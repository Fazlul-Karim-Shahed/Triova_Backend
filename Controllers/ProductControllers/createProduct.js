const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const mongoose = require("mongoose");
const { ProductModel } = require("../../Models/ProductModel");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");
const algoliasearch = require("algoliasearch"); // ✅ Fix import

// ✅ Algolia setup (v4 syntax)
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const createProduct = async (req, res) => {
    console.log("Creating product...");

    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send(err);

        fields = cleanObject(formDataToObj(fields));

        const idFields = ["subBrandId", "brandId", "departmentId", "categoryId", "subCategoryId", "batchId"];
        idFields.forEach((field) => {
            if (fields[field] && !mongoose.Types.ObjectId.isValid(fields[field])) {
                delete fields[field];
            }
        });

        const product = new ProductModel(fields);
        product.subBrandId = fields.subBrandId ? mongoose.Types.ObjectId(fields.subBrandId) : null;

        try {
            const imageFiles = files["imageList[]"];
            if (!imageFiles || (Array.isArray(imageFiles) && imageFiles.length === 0)) {
                return res.send({ message: "Product not created. Image is required", error: true });
            }

            const imageList = await saveMultipleFile(imageFiles);
            product.image = imageList;

            const savedProduct = await product.save();
            console.log("Product saved:", savedProduct);

            const algoliaObject = {
                objectID: savedProduct._id.toString(),
                name: savedProduct.name,
                tags: savedProduct.tags,
                description: savedProduct.description,
                brandId: savedProduct.brandId?.toString(),
                categoryId: savedProduct.categoryId?.toString(),
                departmentId: savedProduct.departmentId?.toString(),
            };

            await algoliaIndex.saveObject(algoliaObject); // ✅ v4 syntax
            console.log("Indexed in Algolia");

            res.send({ message: "Product created successfully", error: false, data: savedProduct });
        } catch (err) {
            console.log("Error:", err);
            res.send({ message: err.message, error: true });
        }
    });
};

module.exports.createProduct = createProduct;
