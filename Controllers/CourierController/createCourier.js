

const { CourierModel } = require("../../Models/CourierModel");
const formidable = require('formidable');
const { formDataToObj } = require('../../Functions/formDataToObj');
const { cleanObject } = require('../../Functions/cleanObject');


const createCourier = async (req, res) => {

    const form = new formidable.IncomingForm();
    form.keepExtensions = true


    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let courier = new CourierModel(fields)

        courier.save().then(data => {
            res.send({ message: 'Coourier created successfully', error: false, data: data });
        }).catch(err => {
            res.send({ message: err.message, error: true });
        });

    });



}

module.exports.createCourier = createCourier
