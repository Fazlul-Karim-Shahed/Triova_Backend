

const fs = require('fs');
const path = require('path');
const { DepartmentModel } = require("../../Models/DepartmentModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const createDepartment = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let department = new DepartmentModel(fields)


        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null


        saveAndGetFile(files.featureImage[0]).then(featureImage => {

            department.featureImage = featureImage

            if (promotionalImage) {

                promotionalImage.then(promotionalImage => {

                    department.promotionalImage = promotionalImage

                    department.save()
                        .then(department => {
                            res.send({ message: 'Department created successfully', error: false, data: department });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }
            else {
                department.save()
                    .then(department => {
                        res.send({ message: 'Department created successfully', error: false, data: department });
                    })
                    .catch(err => {
                        res.send({ message: err.message, error: true, data: err.message });
                    });
            }

        })

    });



}

module.exports.createDepartment = createDepartment
