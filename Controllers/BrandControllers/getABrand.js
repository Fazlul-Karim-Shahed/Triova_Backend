

const { BrandModel } = require("../../Models/BrandModel")


const getABrand = async (req, res) => {

    let brand = await BrandModel.findOne({ _id: req.params.brandId }).populate(['departmentId', 'categoryId'])

    if (brand) {

        res.status(200).send({ message: 'brand found', error: false, data: brand })
    }
    else {
        res.send({ message: 'No brand found', error: true })
    }

}

module.exports.getABrand = getABrand