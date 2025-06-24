const fs = require("fs");
const path = require("path");
const { PromoModel } = require("../../Models/PromoModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { cleanObject } = require("../../Functions/cleanObject");

const createPromo = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(500).send(err);
        }

        fields = cleanObject(formDataToObj(fields));

        let promo = new PromoModel(fields);

        promo
            .save()
            .then((promo) => {
                res.send({ message: "promo created successfully", error: false, data: promo });
            })
            .catch((err) => {
                res.send({ message: err.message, error: true });
            });
    });
};

module.exports.createPromo = createPromo;
