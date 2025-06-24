const { model, Schema } = require("mongoose");

const PromoModel = model(
    "Promo",
    new Schema(
        {
            verified: { type: Boolean, default: false, required: true },
            code: { type: String, unique: true, require: true },
            description: { type: String, default: "" },
            startDate: { type: Date, default: Date.now, require: true },
            endDate: { type: Date, default: Date.now, require: true },
            discount: { type: Number, required: true, min: 0 }, 
            maxAmount: { type: Number, required: true, min: 0, default: 0 },
            minOrder: { type: Number, required: true, min: 0, default: 0 },
        },
        { timestamps: true }
    )
);

module.exports.PromoModel = PromoModel;
