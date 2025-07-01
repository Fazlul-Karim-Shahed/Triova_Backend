const { model, Schema, default: mongoose } = require("mongoose");

const SettingsModel = model(
    "Settings",
    new Schema(
        {
            coverPhoto: { type: Object, contentType: String, name: String },
            bestSelling: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
        },
        { timestamps: true }
    )
);

module.exports.SettingsModel = SettingsModel;
