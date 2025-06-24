


const fs = require('fs');
const path = require('path');
const { BatchModel } = require("../../Models/BatchModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { saveAndGetFile } = require('../../Functions/saveAndGetFile');
const { cleanObject } = require('../../Functions/cleanObject');
const { saveMultipleFile } = require('../../Functions/saveMultipleFile');


const createBatch = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let batch = new BatchModel(fields)


        let documents = files['documents[]'].length > 0 ? saveMultipleFile(files['documents[]']) : null

        if (documents) {

            documents.then(data => {
                batch.documents = data
                batch.save()
                    .then(batch => {
                        res.send({ message: 'batch created successfully', error: false, data: batch });
                    })
                    .catch(err => {
                        res.send({ message: err.message, error: true });
                    });
            })

        }
        else {

            batch.save()
                .then(batch => {
                    res.send({ message: 'batch created successfully', error: false, data: batch });
                })
                .catch(err => {
                    res.send({ message: err.message, error: true });
                });
            
        }

        

    });



}

module.exports.createBatch = createBatch
