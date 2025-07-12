require("dotenv").config(); // ✅ Ensure .env is loaded before using process.env

const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const mongoose = require("mongoose");

const { ProductModel } = require("../../Models/ProductModel");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");

const algoliasearch = require("algoliasearch");

// ✅ Debug logs to confirm env vars are loaded
console.log("ALGOLIA_APP_ID in createProduct:", process.env.ALGOLIA_APP_ID);
console.log("ALGOLIA_API_KEY in createProduct:", process.env.ALGOLIA_API_KEY);

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const createProduct = async (req, res) => {
    console.log("Creating product...");

    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send({ message: "Form parse error", error: true });

        try {
            fields = cleanObject(formDataToObj(fields));

            const idFields = ["subBrandId", "brandId", "departmentId", "categoryId", "subCategoryId", "batchId"];

            // Validate ObjectIDs
            idFields.forEach((field) => {
                if (fields[field] && !mongoose.Types.ObjectId.isValid(fields[field])) {
                    console.warn(`Invalid ObjectId for field: ${field}`);
                    delete fields[field];
                }
            });

            // Create Product instance
            const product = new ProductModel({
                ...fields,
                subBrandId: fields.subBrandId ? new mongoose.Types.ObjectId(fields.subBrandId) : null,
                brandId: fields.brandId ? new mongoose.Types.ObjectId(fields.brandId) : null,
                departmentId: fields.departmentId ? new mongoose.Types.ObjectId(fields.departmentId) : null,
                categoryId: fields.categoryId ? new mongoose.Types.ObjectId(fields.categoryId) : null,
                subCategoryId: fields.subCategoryId ? new mongoose.Types.ObjectId(fields.subCategoryId) : null,
                batchId: fields.batchId ? new mongoose.Types.ObjectId(fields.batchId) : null,
            });

            // Handle image upload
            const imageFiles = files["imageList[]"] || files["imageList"];
            if (!imageFiles || (Array.isArray(imageFiles) && imageFiles.length === 0)) {
                return res.status(400).send({ message: "Product image is required", error: true });
            }

            const imageList = await saveMultipleFile(imageFiles);
            product.image = imageList;

            // Save product to MongoDB
            const savedProduct = await product.save();
            console.log("Product saved:", savedProduct._id);

            // Prepare Algolia object
            const algoliaObject = {
                objectID: savedProduct._id.toString(),
                name: savedProduct.name,
                tags: savedProduct.tags,
                description: savedProduct.description,
                brandId: savedProduct.brandId?.toString(),
                categoryId: savedProduct.categoryId?.toString(),
                departmentId: savedProduct.departmentId?.toString(),
            };

            // Save to Algolia
            await algoliaIndex.saveObject(algoliaObject);
            console.log("Product indexed in Algolia");

            return res.send({
                message: "Product created successfully",
                error: false,
                data: savedProduct,
            });
        } catch (err) {
            console.error("Error creating product:", err);
            return res.status(500).send({ message: err.message, error: true });
        }
    });
};

module.exports.createProduct = createProduct;
