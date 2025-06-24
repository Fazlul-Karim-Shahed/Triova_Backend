
const { model, Schema } = require('mongoose')

const AdminModel = model('Admin', new Schema({

    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String },
    email: { type: String },
    password: {
        type: String,
        max: 1024,
        min: 6,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: 'admin',
        required: true,
    },
    mobile: { type: String, required: [true, "Phone number is required"] },
    nidNumber: { type: String, required: [true, "NID number is required"] },
    image: { contentType: String, type: Object, name: String },
    nidFrontImage: { contentType: String, type: Object, name: String, required: [true, "NID front image is required"] },
    nidBackImage: { contentType: String, type: Object, name: String, required: [true, "NID Back image is required"] },
    mobileVerified: { type: Boolean, default: false, required: true },
    superAdminVerified: { type: Boolean, default: false, required: true },





}, { timestamps: true }))


module.exports.AdminModel = AdminModel