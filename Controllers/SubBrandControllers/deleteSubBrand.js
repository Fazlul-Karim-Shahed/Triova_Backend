
const { SubBrandModel } = require("../../Models/SubBrandModel")
const { ProductModel } = require("../../Models/ProductModel")


const deleteSubBrand = async (req, res) => {

    let subBrand = await SubBrandModel.deleteOne({ _id: req.params.subBrandId })
    let product = await ProductModel.deleteMany({ subBrandId: req.params.subBrandId })

    if (subBrand.deletedCount != 0) {

        res.status(200).send({ message: 'Sub Brand deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No Sub Brand found', error: true })
    }

}

module.exports.deleteSubBrand = deleteSubBrand