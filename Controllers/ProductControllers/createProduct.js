const fs = require("fs");
const path = require("path");
const { ProductModel } = require("../../Models/ProductModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");
const { saveMultipleFile } = require("../../Functions/saveMultipleFile");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { default: mongoose } = require("mongoose");

const createProduct = async (req, res) => {

    console.log("Creating product...");

    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        const idFields = ["subBrandId", "brandId", "departmentId", "categoryId", "subCategoryId", "batchId"];
        idFields.forEach((field) => {
            if (fields[field] && !mongoose.Types.ObjectId.isValid(fields[field])) {
                delete fields[field]; // or set to null if nullable
            }
        });

        let product = new ProductModel(fields);
        product.subBrandId = fields.subBrandId ? mongoose.Types.ObjectId(fields.subBrandId) : null;

        let imageList = files["imageList[]"].length > 0 ? saveMultipleFile(files["imageList[]"]) : null;

        if (imageList) {
            imageList
                .then((data) => {
                    product
                        .save()
                        .then((product) => {
                            console.log("Product: ", product);
                            res.send({ message: "product created successfully", error: false, data: product });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.send({ message: err.message, error: true });
                        });
                })
                .catch((err) => {
                    console.log("Image error", err);
                    res.send({ message: err.message, error: true });
                });
        } else {
            console.log("Product not created. Image is required");
            res.send({ message: "Product not created. Image is required", error: true });
        }
    });
};

module.exports.createProduct = createProduct;
