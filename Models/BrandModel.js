

const { model, Schema } = require('mongoose')

const BrandModel = model('Brand', new Schema({

    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: [true, "Department is required"] },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, "Category is required"] },
    name: { type: String, required: [true, "Category name is required"] },
    description: { type: String },
    logo: { contentType: String, type: Object, name: String, required: true },
    verified: { type: Boolean, default: false, required: true },
    promotionalImage: { contentType: String, type: Object, name: String },
    promotionalDescription: { type: String },
    promotionalLink: { type: String, },

}, { timestamps: true }))


module.exports.BrandModel = BrandModel