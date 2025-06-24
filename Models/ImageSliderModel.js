const { model, Schema } = require("mongoose");

const ImageSliderModel = model(
    "ImageSlider",
    new Schema(
        {
            verified: { type: Boolean, default: false, required: true },
            name: { type: String },
            promotionalImage: { type: Object, required: [true, "Image is required"], contentType: String, name: String },
            description: { type: String, default: "" },
            link: { type: String, default: "" },
        },
        { timestamps: true }
    )
);

module.exports.ImageSliderModel = ImageSliderModel;
