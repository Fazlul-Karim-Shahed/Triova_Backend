const fs = require("fs");
const path = require("path");
const { ImageSliderModel } = require("../../Models/ImageSliderModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");

const createImageSlider = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let imageSlider = new ImageSliderModel(fields);

        let promotionalImage = files.promotionalImage ? saveAndGetFile(files.promotionalImage[0]) : null;

        if (promotionalImage) {
            promotionalImage.then((promotionalImage) => {
                imageSlider.promotionalImage = promotionalImage;

                imageSlider
                    .save()
                    .then((imageSlider) => {
                        res.send({ message: "image Slider created successfully", error: false, data: imageSlider });
                    })
                    .catch((err) => {
                        res.send({ message: err.message, error: true });
                    });
            });
        } else {
            imageSlider
                .save()
                .then((imageSlider) => {
                    res.send({ message: "image Slider created successfully", error: false, data: imageSlider });
                })
                .catch((err) => {
                    res.send({ message: err.message, error: true, data: err.message });
                });
        }
    });
};

module.exports.createImageSlider = createImageSlider;
