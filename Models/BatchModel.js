


const { model, Schema } = require('mongoose')

const BatchModel = model('Batch', new Schema({

    verified: { type: Boolean, default: false, required: true },

    name: { type: String, required: [true, "Batch name is required"] },
    companyName: { type: String, required: [true, "Company Name is required"] },
    documents: [{ contentType: String, type: Object, name: String, required: true }],
    description: { type: String },

    orderDate: { type: Date, required: [true, 'Order Date is required'] },
    receiveDate: { type: Date, required: [true, 'Receive Date is required'] },
    totalExpenses: { type: Number, required: [true, 'Total Expenses is required'] },
    expensesList: [{ type: Object, name: String, amount: Number }],
    incomeList: [{ type: Object, name: String, amount: Number }],



}, { timestamps: true }))


module.exports.BatchModel = BatchModel