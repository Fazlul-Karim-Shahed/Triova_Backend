const fs = require("fs");
const path = require("path");
const { ProductModel } = require("../../Models/ProductModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");
const { default: mongoose } = require("mongoose");

// ✅ Algolia Setup
const algoliasearch = require("algoliasearch");
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const updateProduct = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    let imageStatus = "";

    let product = await ProductModel.findOne({ _id: req.params.productId });

    if (!product) {
        return res.status(404).send({ message: "Product not found", error: true });
    }

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).send(err);

        imageStatus = fields.image && fields.image[0] === "none" ? fields.image[0] : "";

        fields = cleanObject(formDataToObj(fields));
        Object.assign(product, fields);

        product.sizes = fields.sizes || [];
        product.colors = fields.colors || [];
        product.subBrandId = fields.subBrandId ? mongoose.Types.ObjectId(fields.subBrandId) : null;

        if (imageStatus === "none") {
            product.image = [];
        }

        let imageList = files && files["imageList[]"] && files["imageList[]"].length > 0 ? saveMultipleFile(files["imageList[]"]) : null;

        const saveAndIndex = async () => {
            try {
                const updated = await product.save();

                // ✅ Update Algolia
                const algoliaObject = {
                    objectID: updated._id.toString(),
                    _id: updated._id.toString(),
                    name: updated.name,
                    tags: updated.tags,
                    description: updated.description,
                    brandId: updated.brandId?.toString(),
                    categoryId: updated.categoryId?.toString(),
                    departmentId: updated.departmentId?.toString(),
                };

                await algoliaIndex.saveObject(algoliaObject);

                res.send({
                    message: "Product updated successfully",
                    error: false,
                    data: updated,
                });
            } catch (err) {
                res.send({ message: err.message, error: true });
            }
        };

        if (imageList) {
            imageList
                .then((data) => {
                    product.image = data;
                    saveAndIndex();
                })
                .catch((err) => {
                    res.send({ message: err.message, error: true });
                });
        } else {
            saveAndIndex();
        }
    });
};

module.exports.updateProduct = updateProduct;
