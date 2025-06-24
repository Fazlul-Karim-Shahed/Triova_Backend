


const fs = require('fs');
const path = require('path');
const { SubBrandModel } = require("../../Models/SubBrandModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateSubBrand = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true

    let subBrand = await SubBrandModel.findOne({ _id: req.params.subBrandId })

    form.parse(req, (err, fields, files) => {
        if (err) {
            return { message: err.message, error: true };
        }

        fields = cleanObject(formDataToObj(fields));

        Object.assign(subBrand, fields);

        if (files && Object.keys(files).length != 0) {

            let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null
            let logo = files.logo ? saveAndGetFile(files.logo[0]) : null

            if (logo) {
                logo.then(logo => {

                    subBrand.logo = logo

                    if (promotionalImage) {

                        promotionalImage.then(promotionalImage => {

                            subBrand.promotionalImage = promotionalImage

                            subBrand.save()
                                .then(subBrand => {
                                    res.send({ message: 'Sub Brand updated successfully', error: false, data: subBrand });
                                })
                                .catch(err => {
                                    res.send({ message: err.message, error: true });
                                });
                        })
                    }
                    else {
                        subBrand.save()
                            .then(subBrand => {
                                res.send({ message: 'Sub Brand updated successfully', error: false, data: subBrand });
                            })
                            .catch(err => {
                                res.send({ message: err.message, error: true, data: err.message });
                            });
                    }

                })
            }
            else {
                promotionalImage.then(promotionalImage => {

                    subBrand.promotionalImage = promotionalImage

                    subBrand.save()
                        .then(subBrand => {
                            res.send({ message: 'Sub Brand updated successfully', error: false, data: subBrand });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }



        }
        else {
            subBrand.save()
                .then(subBrand => {
                    res.send({ message: 'Sub Brand updated successfully', error: false, data: subBrand });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true });
                });
        }

    });



}

module.exports.updateSubBrand = updateSubBrand
