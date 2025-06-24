

const { model, Schema } = require('mongoose')

const DepartmentModel = model('Department', new Schema({

    name: { type: String, required: [true, "name is required"] },
    description: { type: String },
    featureImage: { contentType: String, type: Object, name: String, required: [true, 'Feature image is required'] },
    status: { type: Boolean, default: true, required: true },
    verified: { type: Boolean, default: false, required: true },
    promotionalImage: { contentType: String, type: Object, name: String },
    promotionalDescription: { type: String },
    promotionalLink: { type: String, },
    visible: { type: Boolean, default: false, required: true },

}, { timestamps: true }))


module.exports.DepartmentModel = DepartmentModel