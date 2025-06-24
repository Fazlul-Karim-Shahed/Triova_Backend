const fs = require("fs");
const path = require("path");
const { EventModel } = require("../../Models/EventModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const mongoose = require("mongoose");

const createEvent = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        if (fields.products && Array.isArray(fields.products)) {
            const mongoose = require("mongoose");
            fields.products = fields.products.map((id) => new mongoose.Types.ObjectId(id));
        }

        let event = new EventModel(fields);

        console.log(event);

        const promotionalImage = files && files.promotionalImage.length > 0 ? saveAndGetFile(files.promotionalImage[0]) : null;

        // console.log(promotionalImage);

        promotionalImage.then((promotionalImage) => {
            event.promotionalImage = promotionalImage;
            event._id = event._id;

            // console.log(promotionalImage);
            event
                .save()
                .then((event) => {
                    console.log(event);
                    res.send({ message: "image Slider created successfully", error: false, data: event });
                })
                .catch((err) => {
                    console.log(err);
                    res.send({ message: err.message, error: true });
                });
        });
    });
};

module.exports.createEvent = createEvent;
