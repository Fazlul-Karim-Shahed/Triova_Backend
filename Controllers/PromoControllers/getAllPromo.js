

const { PromoModel } = require("../../Models/PromoModel")


const getAllPromo = async (req, res) => {

    let promo = await PromoModel.find().populate('owner')

    if (promo.length != 0) {

        res.status(200).send({ message: 'All promo', error: false, data: promo })
    }
    else {
        res.send({ message: 'No promo found', error: true })
    }


}
 
module.exports.getAllPromo = getAllPromo;