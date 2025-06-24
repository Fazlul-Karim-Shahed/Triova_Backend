const fs = require("fs");
const path = require("path");
const { BrandModel } = require("../../Models/BrandModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");

const createBrand = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let brand = new BrandModel(fields);

        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null;

        saveAndGetFile(files.logo[0]).then((logo) => {
            brand.logo = logo;

            if (promotionalImage) {
                promotionalImage.then((promotionalImage) => {

                    brand.promotionalImage = promotionalImage

                    brand.save()
                        .then(brand => {
                            res.send({ message: 'Brand created successfully', error: false, data: brand });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                });
            } else {
                brand
                    .save()
                    .then((brand) => {
                        res.send({ message: "Brand created successfully", error: false, data: brand });
                    })
                    .catch((err) => {
                        res.send({ message: err.message, error: true, data: err.message });
                    });
            }
        });
    });
};

module.exports.createBrand = createBrand;
