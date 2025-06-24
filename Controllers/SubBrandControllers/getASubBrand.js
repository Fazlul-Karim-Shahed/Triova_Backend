

const { SubBrandModel } = require("../../Models/SubBrandModel")


const getASubBrand = async (req, res) => {

    let subBrand = await SubBrandModel.findOne({ _id: req.params.subBrandId }).populate(['departmentId', 'categoryId'])

    if (subBrand) {

        res.status(200).send({ message: 'Sub Brand found', error: false, data: subBrand })
    }
    else {
        res.send({ message: 'No Sub Brand found', error: true })
    }

}

module.exports.getASubBrand = getASubBrand