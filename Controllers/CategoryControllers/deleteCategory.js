
const { BrandModel } = require("../../Models/BrandModel")
const { CategoryModel } = require("../../Models/CategoryModel")
const { SubCategoryModel } = require("../../Models/SubCategoryModel")
const { SubBrandModel } = require("../../Models/SubBrandModel")
const { ProductModel } = require("../../Models/ProductModel")


const deleteCategory = async (req, res) => {


    let category = await CategoryModel.deleteOne({ _id: req.params.categoryId })
    let subCategory = await SubCategoryModel.deleteMany({ categoryId: req.params.categoryId })
    let subBrand = await SubBrandModel.deleteMany({ categoryId: req.params.categoryId })
    let brand = await BrandModel.deleteMany({ categoryId: req.params.categoryId })
    let product = await ProductModel.deleteMany({ categoryId: req.params.categoryId })

    if (category.deletedCount != 0) {

        res.status(200).send({ message: 'Category deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No category found', error: true })
    }

}

module.exports.deleteCategory = deleteCategory
