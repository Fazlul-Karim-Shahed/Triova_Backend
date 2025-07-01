const { SettingsModel } = require("../../Models/SettingsModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const mongoose = require("mongoose");

const createSettings = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({ message: "Form parsing failed", error: true });
        }

        fields = cleanObject(formDataToObj(fields));

        // Convert bestSelling to ObjectIds
        if (fields.bestSelling && Array.isArray(fields.bestSelling)) {
            fields.bestSelling = fields.bestSelling.map((id) => new mongoose.Types.ObjectId(id));
        }

        // Handle coverPhoto
        const coverPhoto = files?.coverPhoto?.[0];
        if (coverPhoto && coverPhoto.size > 0) {
            fields.coverPhoto = await saveAndGetFile(coverPhoto);
        }

        try {
            const settings = new SettingsModel(fields);
            const saved = await settings.save();
            res.send({ message: "✅ Settings created successfully", error: false, data: saved });
        } catch (err) {
            res.status(500).send({ message: err.message, error: true });
        }
    });
};

module.exports.createSettings = createSettings;
