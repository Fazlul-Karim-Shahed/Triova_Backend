
const fs = require('fs');
const path = require('path');
const { SubBrandModel } = require("../../Models/SubBrandModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const createSubBrand = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let subBrand = new SubBrandModel(fields)


        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null


        saveAndGetFile(files.logo[0]).then(logo => {

            subBrand.logo = logo

            if (promotionalImage) {

                promotionalImage.then(promotionalImage => {

                    subBrand.promotionalImage = promotionalImage

                    subBrand.save()
                        .then(subBrand => {
                            res.send({ message: 'Sub Brand created successfully', error: false, data: subBrand });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }
            else {
                subBrand.save()
                    .then(subBrand => {
                        res.send({ message: 'Sub Brand created successfully', error: false, data: subBrand });
                    })
                    .catch(err => {
                        res.send({ message: err.message, error: true, data: err.message });
                    });
            }

        })

    });



}

module.exports.createSubBrand = createSubBrand
