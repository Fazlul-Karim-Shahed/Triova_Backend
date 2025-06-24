
const { DepartmentModel } = require("../../Models/DepartmentModel")
const { BrandModel } = require("../../Models/BrandModel")
const { CategoryModel } = require("../../Models/CategoryModel")
const { SubCategoryModel } = require("../../Models/SubCategoryModel")
const { SubBrandModel } = require("../../Models/SubBrandModel")
const { ProductModel } = require("../../Models/ProductModel")


const deleteDepartment = async (req, res) => {

    let department = await DepartmentModel.deleteOne({ _id: req.params.departmentId })
    let category = await CategoryModel.deleteMany({ departmentId: req.params.departmentId })
    let subCategory = await SubCategoryModel.deleteMany({ departmentId: req.params.departmentId })
    let subBrand = await SubBrandModel.deleteMany({ departmentId: req.params.departmentId })
    let brand = await BrandModel.deleteMany({ departmentId: req.params.departmentId })
    let product = await ProductModel.deleteMany({ departmentId: req.params.departmentId })


    if (department.deletedCount != 0) {

        res.status(200).send({ message: 'Department deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No department found', error: true })
    }

}

module.exports.deleteDepartment = deleteDepartment