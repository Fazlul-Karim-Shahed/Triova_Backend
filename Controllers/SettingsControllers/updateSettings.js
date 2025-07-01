const { SettingsModel } = require("../../Models/SettingsModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const mongoose = require("mongoose");

const updateSettings = async (req, res) => {
    // Enable multiples: true to parse multiple same keys as array
    const form = new formidable.IncomingForm({ multiples: true });
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({ message: "Form parsing failed", error: true });
        }

        // Debug: see what bestSelling looks like
        console.log("BESTSELLING raw:", fields.bestSelling);

        const settingsId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(settingsId)) {
            return res.status(400).send({ message: "Invalid Settings ID", error: true });
        }

        // Normalize bestSelling to array (even if single or comma-separated string)
        if (fields.bestSelling) {
            if (!Array.isArray(fields.bestSelling)) {
                if (typeof fields.bestSelling === "string" && fields.bestSelling.includes(",")) {
                    fields.bestSelling = fields.bestSelling.split(",");
                } else {
                    fields.bestSelling = [fields.bestSelling];
                }
            }
        }

        // Convert bestSelling IDs to ObjectId
        if (fields.bestSelling) {
            fields.bestSelling = fields.bestSelling.map((id) => new mongoose.Types.ObjectId(id));
        }

        // Clean other fields, but preserve bestSelling as is
        const cleanedFields = cleanObject(formDataToObj(fields));
        cleanedFields.bestSelling = fields.bestSelling;

        try {
            let settings = await SettingsModel.findById(settingsId);
            if (!settings) {
                return res.status(404).send({ message: "Settings not found", error: true });
            }

            // Handle coverPhoto file upload
            const coverPhoto = files?.coverPhoto?.[0];
            if (coverPhoto && coverPhoto.size > 0) {
                cleanedFields.coverPhoto = await saveAndGetFile(coverPhoto);
            } else {
                cleanedFields.coverPhoto = settings.coverPhoto;
            }

            // Assign updated fields to the model
            Object.keys(cleanedFields).forEach((key) => {
                settings[key] = cleanedFields[key];
            });

            console.log("Updated settings:", settings);
            const updated = await settings.save();
            res.send({ message: "✅ Settings updated successfully", error: false, data: updated });
        } catch (err) {
            res.status(500).send({ message: err.message, error: true });
        }
    });
};

module.exports.updateSettings = updateSettings;
