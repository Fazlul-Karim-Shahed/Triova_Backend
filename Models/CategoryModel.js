



const { model, Schema } = require('mongoose')

const CategoryModel = model('Category', new Schema({

    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: [true, "Department is required"] },
    name: { type: String, required: [true, "Category name is required"] },
    description: { type: String },
    featureImage: { contentType: String, type: Object, name: String, required: true },
    status: { type: Boolean, default: true, required: true },
    verified: { type: Boolean, default: false, required: true },
    promotionalImage: { contentType: String, type: Object, name: String },
    promotionalDescription: { type: String },
    promotionalLink: { type: String, },
    visible: { type: Boolean, default: false, required: true },

}, { timestamps: true }))


module.exports.CategoryModel = CategoryModel