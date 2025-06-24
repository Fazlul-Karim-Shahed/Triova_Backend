

const { model, Schema } = require('mongoose')

const EmployeeModel = model('Employee', new Schema({

    firstName: { type: String, required: [true, "First name is required"] },
    lastName: { type: String },
    email: { type: String },
    password: {
        type: String,
        max: 1024,
        min: 6,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        default: 'employee',
        required: [true, 'Role is required'],
    },

    department: { type: String, required: [true, "Department name is required"] },
    position: { type: String, required: [true, "Position is required"] },
    salary: { type: Number, required: [true, "Salary is required"] },
    address: { type: String, required: [true, "Address is required"] },
    mobile: { type: String, required: [true, "Phone number is required"] },
    dob: { type: Date, required: [true, "Date of birth is required "] },
    nidNumber: { type: String, required: [true, "NID is required"] },
    nidFrontImage: { contentType: String, type: Object, name: String, required: true },
    nidBackImage: { contentType: String, type: Object, name: String, required: true },
    image: { contentType: String, type: Object, name: String },
    mobileVerified: { type: Boolean, default: false, required: true },
    superAdminVerified: { type: Boolean, default: false, required: true },

}, { timestamps: true }))


module.exports.EmployeeModel = EmployeeModel