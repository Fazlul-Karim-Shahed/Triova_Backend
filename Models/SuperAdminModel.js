

const { model, Schema } = require('mongoose')

const SuperAdminModel = model('SuperAdmin', new Schema({

    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String },
    email: { type: String },
    password: {
        type: String,
        max: 1024,
        min: 6,
        required: true
    },
    role: {
        type: String,
        default: 'superadmin',
        required: true,
    },
    mobile: { type: String, required: true },
    nidNumber: { type: String, required: false },
    image: { contentType: String, type: Object, name: String },
    nidFrontImage: { contentType: String, type: Object, name: String, required: false },
    nidBackImage: { contentType: String, type: Object, name: String, required: false },
    mobileVerified: { type: Boolean, default: false }




}, { timestamps: true }))


module.exports.SuperAdminModel = SuperAdminModel