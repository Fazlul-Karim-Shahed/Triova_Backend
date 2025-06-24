


const fs = require('fs');
const path = require('path');
const { DepartmentModel } = require("../../Models/DepartmentModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');


const updateDepartment = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true

    let department = await DepartmentModel.findOne({ _id: req.params.departmentId })


    form.parse(req, (err, fields, files) => {
        if (err) {
            return { message: err.message, error: true };
        }

        fields = cleanObject(formDataToObj(fields));

        Object.assign(department, fields);

        if (files && Object.keys(files).length != 0) {

            let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null
            let featureImage = files.featureImage ? saveAndGetFile(files.featureImage[0]) : null

            if (featureImage) {
                featureImage.then(featureImage => {

                    department.featureImage = featureImage

                    if (promotionalImage) {

                        promotionalImage.then(promotionalImage => {

                            department.promotionalImage = promotionalImage

                            department.save()
                                .then(department => {
                                    res.send({ message: 'Department updated successfully', error: false, data: department });
                                })
                                .catch(err => {
                                    res.send({ message: err.message, error: true });
                                });
                        })
                    }
                    else {
                        department.save()
                            .then(department => {
                                res.send({ message: 'Department updated successfully', error: false, data: department });
                            })
                            .catch(err => {
                                res.send({ message: err.message, error: true, data: err.message });
                            });
                    }

                })
            }
            else {
                promotionalImage.then(promotionalImage => {

                    department.promotionalImage = promotionalImage

                    department.save()
                        .then(department => {
                            res.send({ message: 'Department updated successfully', error: false, data: department });
                        })
                        .catch(err => {
                            res.send({ message: err.message, error: true });
                        });
                })
            }



        }
        else {
            department.save()
                .then(department => {
                    res.send({ message: 'Department updated successfully', error: false, data: department });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true});
                });
        }

    });



}

module.exports.updateDepartment = updateDepartment
