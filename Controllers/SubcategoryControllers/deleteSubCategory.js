
const { SubCategoryModel } = require("../../Models/SubCategoryModel")
const { ProductModel } = require("../../Models/ProductModel")
const { BrandModel } = require("../../Models/BrandModel")
const {SubBrandModel} = require("../../Models/SubBrandModel")


const deleteSubCategory = async (req, res) => {


    let subCategory = await SubCategoryModel.deleteOne({ _id: req.params.subCategoryId })
    let product = await ProductModel.deleteMany({ subCategoryId: req.params.subCategoryId })
    let brand = await BrandModel.deleteMany({ subCategoryId: req.params.subCategoryId })
    let subBrand = await SubBrandModel.deleteMany({ subCategoryId: req.params.subCategoryId })

    if (subCategory.deletedCount != 0) {

        res.status(200).send({ message: 'Sub Category deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No Sub Category found', error: true })
    }

}

module.exports.deleteSubCategory = deleteSubCategory