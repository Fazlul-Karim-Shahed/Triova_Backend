



const { model, Schema } = require('mongoose')

const CourierModel = model('Courier', new Schema({

    name: { type: String, required: [true, "Courier name is required"] },
    phone: { type: Number },

}, { timestamps: true }))


module.exports.CourierModel = CourierModel