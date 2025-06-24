
const fs = require('fs');
const path = require('path');
const { SubCategoryModel } = require("../../Models/SubCategoryModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const createSubCategory = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let subCategory = new SubCategoryModel(fields)


        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null


        saveAndGetFile(files.featureImage[0]).then(featureImage => {

            subCategory.featureImage = featureImage

            if (promotionalImage) {

                promotionalImage.then(promotionalImage => {

                    subCategory.promotionalImage = promotionalImage

                    subCategory.save()
                        .then(subCategory => {
                            res.send({ message: 'Sub Category created successfully', error: false, data: subCategory });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }
            else {
                subCategory.save()
                    .then(subCategory => {
                        res.send({ message: 'Sub Category created successfully', error: false, data: subCategory });
                    })
                    .catch(err => {
                        res.send({ message: err.message, error: true, data: err.message });
                    });
            }

        })

    });



}

module.exports.createSubCategory = createSubCategory
