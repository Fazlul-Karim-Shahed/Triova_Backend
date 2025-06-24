

const { BrandModel } = require("../../Models/BrandModel")


const getBrandByCategory = async (req, res) => {

    let brand = await BrandModel.find({ categoryId: req.params.categoryId }).populate(['departmentId', 'categoryId'])

    if (brand.length != 0) {

        res.status(200).send({ message: 'All brand', error: false, data: brand })
    }
    else {
        res.send({ message: 'No brand found', error: true })
    }


}

module.exports.getBrandByCategory = getBrandByCategory