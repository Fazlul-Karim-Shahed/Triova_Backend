const { EventModel } = require("../../Models/EventModel");
const formidable = require("formidable");
const { formDataToObj } = require("../../Functions/formDataToObj");
const { saveAndGetFile } = require("../../Functions/saveAndGetFile");
const { cleanObject } = require("../../Functions/cleanObject");
const mongoose = require("mongoose");

const updateEvent = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(500).send({ message: "Form parsing failed", error: true });
        }

        const eventId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).send({ message: "Invalid Event ID", error: true });
        }

        fields = cleanObject(formDataToObj(fields));

        // Convert product IDs to ObjectId
        if (fields.products && Array.isArray(fields.products)) {
            fields.products = fields.products.map((id) => new mongoose.Types.ObjectId(id));
        }

        try {
            let event = await EventModel.findById(eventId);
            if (!event) {
                return res.status(404).send({ message: "Event not found", error: true });
            }

            // Handle promotional image
            if (files.promotionalImage && files.promotionalImage[0]?.size > 0) {
                const savedImage = await saveAndGetFile(files.promotionalImage[0]);
                if (savedImage) {
                    event.promotionalImage = savedImage;
                }
            } else {
                // Retain the existing image if no new image is uploaded
                fields.promotionalImage = event.promotionalImage;
            }

            // Update fields
            Object.keys(fields).forEach((key) => {
                event[key] = fields[key];
            });

            const updated = await event.save();
            res.send({ message: "✅ Event updated successfully", error: false, data: updated });
        } catch (err) {
            res.status(500).send({ message: err.message, error: true });
        }
    });
};

module.exports.updateEvent = updateEvent;
