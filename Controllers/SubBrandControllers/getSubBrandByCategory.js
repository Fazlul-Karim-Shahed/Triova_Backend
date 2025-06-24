

const { SubBrandModel } = require("../../Models/SubBrandModel")


const getSubBrandByCategory = async (req, res) => {

    let subBrand = await SubBrandModel.find({ categoryId: req.params.categoryId }).populate(['departmentId', 'categoryId', 'brandId'])

    if (subBrand.length != 0) {

        res.status(200).send({ message: 'All Sub Brand', error: false, data: subBrand })
    }
    else {
        res.send({ message: 'No Sub Brand found', error: true })
    }


}

module.exports.getSubBrandByCategory = getSubBrandByCategory