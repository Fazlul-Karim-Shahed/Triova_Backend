require("dotenv").config(); // ✅ Ensure .env is loaded

const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { default: mongoose } = require("mongoose");

const { ProductModel } = require("../../Models/ProductModel");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");

// ✅ Algolia Setup
const algoliasearch = require("algoliasearch");

console.log("ALGOLIA_APP_ID in updateProduct:", process.env.ALGOLIA_APP_ID);
console.log("ALGOLIA_API_KEY in updateProduct:", process.env.ALGOLIA_API_KEY);

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const updateProduct = async (req, res) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });
    let imageStatus = "";

    let product;
    try {
        product = await ProductModel.findById(req.params.productId);
        if (!product) {
            return res.status(404).send({ message: "Product not found", error: true });
        }
    } catch (err) {
        return res.status(400).send({ message: "Invalid product ID", error: true });
    }

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send({ message: "Form parse error", error: true });

        imageStatus = fields.image && fields.image[0] === "none" ? fields.image[0] : "";

        fields = cleanObject(formDataToObj(fields));
        Object.assign(product, fields);

        product.sizes = fields.sizes || [];
        product.colors = fields.colors || [];

        product.subBrandId = fields.subBrandId && mongoose.Types.ObjectId.isValid(fields.subBrandId) ? new mongoose.Types.ObjectId(fields.subBrandId) : null;

        if (imageStatus === "none") {
            product.image = [];
        }

        const imageFiles = files["imageList[]"] || files["imageList"];
        const hasImages = imageFiles && Array.isArray(imageFiles) && imageFiles.length > 0;

        const saveAndIndex = async () => {
            try {
                const updated = await product.save();

                // ✅ Algolia update
                const algoliaObject = {
                    objectID: updated._id.toString(),
                    name: updated.name,
                    tags: updated.tags,
                    description: updated.description,
                    brandId: updated.brandId?.toString(),
                    categoryId: updated.categoryId?.toString(),
                    departmentId: updated.departmentId?.toString(),
                };

                await algoliaIndex.saveObject(algoliaObject);
                console.log("Updated in Algolia:", updated._id);

                res.send({
                    message: "Product updated successfully",
                    error: false,
                    data: updated,
                });
            } catch (err) {
                console.error("Save/index error:", err);
                res.status(500).send({ message: err.message, error: true });
            }
        };

        if (hasImages) {
            saveMultipleFile(imageFiles)
                .then((data) => {
                    product.image = data;
                    saveAndIndex();
                })
                .catch((err) => {
                    console.error("Image upload error:", err);
                    res.status(500).send({ message: err.message, error: true });
                });
        } else {
            saveAndIndex();
        }
    });
};

module.exports.updateProduct = updateProduct;
