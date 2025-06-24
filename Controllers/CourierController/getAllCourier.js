



const { CourierModel } = require("../../Models/CourierModel")


const getAllCourier = async (req, res) => {

    let courier = await CourierModel.find()

    if (courier.length != 0) {

        res.status(200).send({ message: 'All courier', error: false, data: courier })
    }
    else {
        res.send({ message: 'No courier found', error: true })
    }

}

module.exports.getAllCourier = getAllCourier