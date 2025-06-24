


const fs = require('fs');
const path = require('path');
const { BrandModel } = require("../../Models/BrandModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateBrand = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true

    let brand = await BrandModel.findOne({ _id: req.params.brandId })

    form.parse(req, (err, fields, files) => {
        if (err) {
            return { message: err.message, error: true };
        }

        fields = cleanObject(formDataToObj(fields));

        Object.assign(brand, fields);

        if (files && Object.keys(files).length != 0) {

            let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null
            let logo = files.logo ? saveAndGetFile(files.logo[0]) : null

            if (logo) {
                logo.then(logo => {

                    brand.logo = logo

                    if (promotionalImage) {

                        promotionalImage.then(promotionalImage => {

                            brand.promotionalImage = promotionalImage

                            brand.save()
                                .then(brand => {
                                    res.send({ message: 'Brand updated successfully', error: false, data: brand });
                                })
                                .catch(err => {
                                    res.send({ message: err.message, error: true });
                                });
                        })
                    }
                    else {
                        brand.save()
                            .then(brand => {
                                res.send({ message: 'Brand updated successfully', error: false, data: brand });
                            })
                            .catch(err => {
                                res.send({ message: err.message, error: true, data: err.message });
                            });
                    }

                })
            }
            else {
                promotionalImage.then(promotionalImage => {

                    brand.promotionalImage = promotionalImage

                    brand.save()
                        .then(brand => {
                            res.send({ message: 'Brand updated successfully', error: false, data: brand });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }



        }
        else {
            brand.save()
                .then(brand => {
                    res.send({ message: 'Brand updated successfully', error: false, data: brand });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true });
                });
        }

    });



}

module.exports.updateBrand = updateBrand
