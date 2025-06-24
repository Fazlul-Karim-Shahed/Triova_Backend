

const { PromoModel } = require("../../Models/PromoModel")


const deletePromo = async (req, res) => {


    let promo = await PromoModel.deleteOne({ _id: req.params.promoId })


    if (promo.deletedCount != 0) {

        res.status(200).send({ message: 'promo deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No promo found', error: true })
    }

}

module.exports.deletePromo = deletePromo