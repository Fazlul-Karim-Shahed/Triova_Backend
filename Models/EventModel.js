const { model, Schema } = require("mongoose");

const EventModel = model(
    "Event",
    new Schema(
        {
            verified: { type: Boolean, default: false, required: true },
            name: { type: String },
            promotionalImage: { type: Object, required: [true, "Image is required"], contentType: String, name: String },
            description: { type: String, default: "" },
            startDate: { type: Date, default: Date.now },
            endDate: { type: Date, default: Date.now },
            link: { type: String, default: "" },
            products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
        },
        { timestamps: true }
    )
);

module.exports.EventModel = EventModel;
