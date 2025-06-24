
const { SubBrandModel } = require("../../Models/SubBrandModel")


const getAllSubBrand = async (req, res) => {

    let subBrand = await SubBrandModel.find().populate(['departmentId', 'categoryId', 'brandId'])

    if (subBrand.length != 0) {

        res.status(200).send({ message: 'All sub brand', error: false, data: subBrand })
    }
    else {
        res.send({ message: 'No sub brand found', error: true })
    }


}
 
module.exports.getAllSubBrand = getAllSubBrand