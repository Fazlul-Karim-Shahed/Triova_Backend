
const { model, Schema } = require('mongoose')

const ExpenseModel = model('Expense', new Schema({

    amount: { type: Number, required: [true, 'Amount is required'] },
    description: { type: String,  },
    date: { type: Date, required: [true, 'Date is required'] },
    documents: [{ contentType: String, type: Object, name: String }],
    verified: { type: Boolean, default: false, required: true  },
    companyName: { type: String, required: [true, 'Company Name is required'] },

}, { timestamps: true }))


module.exports.ExpenseModel = ExpenseModel