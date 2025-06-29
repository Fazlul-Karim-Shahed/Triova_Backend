const { PromoModel } = require("../../Models/PromoModel");

const getAPromo = async (req, res) => {
    // //console.log(req.params.code);
    let promo = await PromoModel.findOne({ code: req.params.code }).populate("owner");
    // //console.log(promo)

    if (promo) {
        res.status(200).send({ message: "Promo code matched", error: false, data: promo });
    } else {
        res.send({ message: "No promo found", error: true });
    }
};

module.exports.getAPromo = getAPromo;
