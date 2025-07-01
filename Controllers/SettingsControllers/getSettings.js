const { SettingsModel } = require("../../Models/SettingsModel");

const getSettings = async (req, res) => {
    try {
        const settings = await SettingsModel.find().populate("bestSelling")
            .sort({ createdAt: -1 }) // latest
            .populate("bestSelling", "name sellingPrice image");

        if (!settings) {
            return res.status(404).send({ message: "Settings not found", error: true });
        }

        res.send({ message: "✅ Settings fetched successfully", error: false, data: settings[0] });
    } catch (err) {
        res.status(500).send({ message: err.message, error: true });
    }
};

module.exports.getSettings = getSettings;
