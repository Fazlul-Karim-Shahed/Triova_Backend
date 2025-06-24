



const fs = require('fs');
const path = require('path');
const { CategoryModel } = require("../../Models/CategoryModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const createCategory = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let category = new CategoryModel(fields)


        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null


        saveAndGetFile(files.featureImage[0]).then(featureImage => {

            category.featureImage = featureImage

            if (promotionalImage) {

                promotionalImage.then(promotionalImage => {

                    category.promotionalImage = promotionalImage

                    category.save()
                        .then(category => {
                            res.send({ message: 'Category created successfully', error: false, data: category });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }
            else {
                category.save()
                    .then(category => {
                        res.send({ message: 'Category created successfully', error: false, data: category });
                    })
                    .catch(err => {
                        res.send({ message: err.message, error: true, data: err.message });
                    });
            }

        })

    });



}

module.exports.createCategory = createCategory
