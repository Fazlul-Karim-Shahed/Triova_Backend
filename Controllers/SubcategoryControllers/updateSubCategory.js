


const fs = require('fs');
const path = require('path');
const { SubCategoryModel } = require("../../Models/SubCategoryModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateSubCategory = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true

    let subCategory = await SubCategoryModel.findOne({ _id: req.params.subCategoryId })

    form.parse(req, (err, fields, files) => {
        if (err) {
            return { message: err.message, error: true };
        }

        fields = cleanObject(formDataToObj(fields));

        Object.assign(subCategory, fields);

        if (files && Object.keys(files).length != 0) {

            let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null
            let featureImage = files.featureImage ? saveAndGetFile(files.featureImage[0]) : null

            if (featureImage) {
                featureImage.then(featureImage => {

                    subCategory.featureImage = featureImage

                    if (promotionalImage) {

                        promotionalImage.then(promotionalImage => {

                            subCategory.promotionalImage = promotionalImage

                            subCategory.save()
                                .then(subCategory => {
                                    res.send({ message: 'Sub Category updated successfully', error: false, data: subCategory });
                                })
                                .catch(err => {
                                    res.send({ message: err.message, error: true });
                                });
                        })
                    }
                    else {
                        subCategory.save()
                            .then(subCategory => {
                                res.send({ message: 'Sub Category updated successfully', error: false, data: subCategory });
                            })
                            .catch(err => {
                                res.send({ message: err.message, error: true, data: err.message });
                            });
                    }

                })
            }
            else {
                promotionalImage.then(promotionalImage => {

                    subCategory.promotionalImage = promotionalImage

                    subCategory.save()
                        .then(subCategory => {
                            res.send({ message: 'Sub Category updated successfully', error: false, data: subCategory });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }



        }
        else {
            subCategory.save()
                .then(subCategory => {
                    res.send({ message: 'Sub Category updated successfully', error: false, data: subCategory });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true });
                });
        }

    });

}

module.exports.updateSubCategory = updateSubCategory
