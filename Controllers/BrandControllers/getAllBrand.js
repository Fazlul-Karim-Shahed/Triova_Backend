
const { BrandModel } = require("../../Models/BrandModel")


const getAllBrand = async (req, res) => {

    let brand = await BrandModel.find().populate(['departmentId', 'categoryId'])

    if (brand.length != 0) {

        res.status(200).send({ message: 'All brand', error: false, data: brand })
    }
    else {
        res.send({ message: 'No brand found', error: true })
    }


}
 
module.exports.getAllBrand = getAllBrand