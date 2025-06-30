const { model, Schema } = require("mongoose");

const EmployeeModel = model(
    "Employee",
    new Schema(
        {
            firstName: { type: String, required: [true, "First name is required"] },
            lastName: { type: String },
            email: { type: String, required: [true, "Email is required"] },
            password: {
                type: String,
                max: 1024,
                min: 6,
                required: [true, "Password is required"],
            },
            role: {
                type: String,
                default: "employee",
                enum: ["employee", "brandAmbassador", "promoter", "influencer", "others"],
                required: [true, "Role is required"],
            },

            department: { type: String },
            position: { type: String },
            salary: { type: Number },
            address: { type: String },
            mobile: { type: String, required: [true, "Phone number is required"] },
            dob: { type: Date },
            nidNumber: { type: String },
            nidFrontImage: { contentType: String, type: Object, name: String },
            nidBackImage: { contentType: String, type: Object, name: String },
            image: { contentType: String, type: Object, name: String },
            mobileVerified: { type: Boolean, default: false },
            superAdminVerified: { type: Boolean, default: false, required: true },
            totalCommission: { type: Number, default: 0 },
            payment: [
                {
                    type: Object,
                    amount: { type: Number },
                    date: { type: Date, default: Date.now },
                    description: { type: String },
                    document: { contentType: String, type: Object, name: String },
                    paymentMethod: { type: String, default: "Bkash", enum: ["Cash on Delivery", "Bkash", "Nagad", "Card", "Bank"] },
                    paymentStatus: { type: String, default: "Unpaid", enum: ["Unpaid", "Paid"] },
                    transactionId: { type: String },
                },
            ],
        },
        { timestamps: true }
    )
);

module.exports.EmployeeModel = EmployeeModel;
