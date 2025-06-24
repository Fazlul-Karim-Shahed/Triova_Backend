


const fs = require('fs');
const path = require('path');
const { CategoryModel } = require("../../Models/CategoryModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateCategory = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true

    let category = await CategoryModel.findOne({ _id: req.params.categoryId })


    form.parse(req, (err, fields, files) => {
        if (err) {
            return { message: err.message, error: true };
        }

        fields = cleanObject(formDataToObj(fields));

        Object.assign(category, fields);

        if (files && Object.keys(files).length != 0) {

            let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null
            let featureImage = files.featureImage ? saveAndGetFile(files.featureImage[0]) : null

            if (featureImage) {
                featureImage.then(featureImage => {

                    category.featureImage = featureImage

                    if (promotionalImage) {

                        promotionalImage.then(promotionalImage => {

                            category.promotionalImage = promotionalImage

                            category.save()
                                .then(category => {
                                    res.send({ message: 'Category updated successfully', error: false, data: category });
                                })
                                .catch(err => {
                                    res.send({ message: err.message, error: true });
                                });
                        })
                    }
                    else {
                        category.save()
                            .then(category => {
                                res.send({ message: 'Category updated successfully', error: false, data: category });
                            })
                            .catch(err => {
                                res.send({ message: err.message, error: true, data: err.message });
                            });
                    }

                })
            }
            else {
                promotionalImage.then(promotionalImage => {

                    category.promotionalImage = promotionalImage

                    category.save()
                        .then(category => {
                            res.send({ message: 'Category updated successfully', error: false, data: category });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }



        }
        else {
            category.save()
                .then(category => {
                    res.send({ message: 'Category updated successfully', error: false, data: category });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true });
                });
        }

    });



}

module.exports.updateCategory = updateCategory
