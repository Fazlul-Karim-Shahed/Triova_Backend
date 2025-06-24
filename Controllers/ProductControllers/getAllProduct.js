



const { cleanObject } = require("../../Functions/cleanObject")
const { ProductModel } = require("../../Models/ProductModel")
const { DepartmentModel } = require("../../Models/DepartmentModel")
const { CategoryModel } = require("../../Models/CategoryModel")
const { SubCategoryModel } = require("../../Models/SubCategoryModel")
const { SubBrandModel } = require("../../Models/SubBrandModel")
const { BrandModel } = require("../../Models/BrandModel")
const { roleCheck } = require("../../Middlewares/roleCheck")


const getAllProduct = async (req, res) => {

    let searchParams = cleanObject(req.body)

    if (searchParams.hasOwnProperty("max") || searchParams.hasOwnProperty("min")) {
        searchParams.sellingPrice = {};
    }

    if (searchParams.hasOwnProperty("department")) {
        await DepartmentModel.findOne({ name: searchParams.department }).then(department => {
            searchParams.departmentId = department._id
            delete searchParams.department
        })
    }

    if (searchParams.hasOwnProperty("category")) {

        await CategoryModel.findOne({ name: searchParams.category }).then(category => {
            searchParams.categoryId = category._id
            delete searchParams.category
        })
    }

    if (searchParams.hasOwnProperty("subcategory")) {
        await SubCategoryModel.findOne({ name: searchParams.subcategory }).then(subCategory => {
            searchParams.subCategoryId = subCategory._id
            delete searchParams.subcategory
        })
    }
    if (searchParams.hasOwnProperty("subbrand")) {
        await SubBrandModel.findOne({ name: searchParams.subbrand }).then(subBrand => {
            searchParams.subBrandId = subBrand._id
            delete searchParams.subbrand
        })
    }

    if (searchParams.hasOwnProperty("brand")) {
        await BrandModel.findOne({ name: searchParams.brand }).then(brand => {
            searchParams.brandId = brand._id
            delete searchParams.brand
        })
    }
    if (searchParams.hasOwnProperty("color")) {
        searchParams["colors"] = { $elemMatch: { color: searchParams.color } };
        delete searchParams.color
    }

    if (searchParams.hasOwnProperty("size")) {
        searchParams["sizes"] = { $elemMatch: { size: Number(searchParams.size) } };
        delete searchParams.size
    }

    if (searchParams.hasOwnProperty("min")) {

        searchParams.sellingPrice.$gte = parseFloat(searchParams.min);
        delete searchParams.min;

    }


    if (searchParams.hasOwnProperty("max")) {
        searchParams.sellingPrice.$lte = parseFloat(searchParams.max); // Set the maximum price
        delete searchParams.max;
    }
    if (searchParams.hasOwnProperty("search")) {
        searchParams.$text = { $search: searchParams.search }
        delete searchParams.search
    }


    let products = await ProductModel.find({ verified: true, ...searchParams })
        .sort({ stock: -1 })
        .populate(['batchId', 'departmentId', 'categoryId', 'subCategoryId', 'brandId', 'subBrandId'])
        .limit(req.query.limit)

    // let products = await ProductModel.find({ $text: { $search: true } },
    //     { score: { $meta: "textScore" } }).sort({ score: { $meta: "textScore" } }).populate(['batchId', 'departmentId', 'categoryId', 'subCategoryId', 'brandId', 'subBrandId']).limit(req.query.limit)

    if (products.length != 0) {

        res.status(200).send({ message: 'All products', error: false, data: products })
    }
    else {
        res.send({ message: 'No products found', error: true })
    }

}

module.exports.getAllProduct = getAllProduct

