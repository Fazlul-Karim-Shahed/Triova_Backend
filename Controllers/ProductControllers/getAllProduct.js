const { cleanObject } = require("../../Functions/cleanObject");
const { ProductModel } = require("../../Models/ProductModel");
const { DepartmentModel } = require("../../Models/DepartmentModel");
const { CategoryModel } = require("../../Models/CategoryModel");
const { SubCategoryModel } = require("../../Models/SubCategoryModel");
const { SubBrandModel } = require("../../Models/SubBrandModel");
const { BrandModel } = require("../../Models/BrandModel");

const getAllProduct = async (req, res) => {
    let searchParams = cleanObject(req.body);

    if (searchParams.hasOwnProperty("max") || searchParams.hasOwnProperty("min")) {
        searchParams.sellingPrice = {};
    }

    if (searchParams.hasOwnProperty("department")) {
        const department = await DepartmentModel.findOne({ name: searchParams.department });
        if (department) {
            searchParams.departmentId = department._id;
        }
        delete searchParams.department;
    }

    if (searchParams.hasOwnProperty("category")) {
        const category = await CategoryModel.findOne({ name: searchParams.category });
        if (category) {
            searchParams.categoryId = category._id;
        }
        delete searchParams.category;
    }

    if (searchParams.hasOwnProperty("subcategory")) {
        const subCategory = await SubCategoryModel.findOne({ name: searchParams.subcategory });
        if (subCategory) {
            searchParams.subCategoryId = subCategory._id;
        }
        delete searchParams.subcategory;
    }

    if (searchParams.hasOwnProperty("subbrand")) {
        const subBrand = await SubBrandModel.findOne({ name: searchParams.subbrand });
        if (subBrand) {
            searchParams.subBrandId = subBrand._id;
        }
        delete searchParams.subbrand;
    }

    if (searchParams.hasOwnProperty("brand")) {
        const brand = await BrandModel.findOne({ name: searchParams.brand });
        if (brand) {
            searchParams.brandId = brand._id;
        }
        delete searchParams.brand;
    }

    if (searchParams.hasOwnProperty("color")) {
        searchParams.colors = { $elemMatch: { color: searchParams.color } };
        delete searchParams.color;
    }

    if (searchParams.hasOwnProperty("size")) {
        searchParams.sizes = { $elemMatch: { size: Number(searchParams.size) } };
        delete searchParams.size;
    }

    if (searchParams.hasOwnProperty("min")) {
        searchParams.sellingPrice.$gte = parseFloat(searchParams.min);
        delete searchParams.min;
    }

    if (searchParams.hasOwnProperty("max")) {
        searchParams.sellingPrice.$lte = parseFloat(searchParams.max);
        delete searchParams.max;
    }

    const keyword = searchParams.search;
    delete searchParams.search;

    const isValidSearch = typeof keyword === "string" && keyword.trim() !== "";
    const baseFilter = { ...searchParams };
    let allProducts = [];

    console.log(baseFilter);

    if (isValidSearch) {
        const cleanKeyword = keyword.trim();

        let [textResults, tagResults] = await Promise.all([
            ProductModel.find({ ...baseFilter, $text: { $search: cleanKeyword } }).populate(["batchId", "departmentId", "categoryId", "subCategoryId", "brandId", "subBrandId"]),
            ProductModel.find({ ...baseFilter, tags: { $regex: new RegExp(cleanKeyword, "i") } }).populate(["batchId", "departmentId", "categoryId", "subCategoryId", "brandId", "subBrandId"]),
        ]);

        const productMap = new Map();
        [...textResults, ...tagResults].forEach((product) => {
            productMap.set(product._id.toString(), product);
        });

        allProducts = Array.from(productMap.values());
    } else {
        allProducts = await ProductModel.find(baseFilter).populate(["batchId", "departmentId", "categoryId", "subCategoryId", "brandId", "subBrandId"]);
    }

    // Sort by stock descending
    allProducts.sort((a, b) => b.stock - a.stock);

    // Apply limit
    const limit = parseInt(req.query.limit) || allProducts.length;
    const limitedProducts = allProducts.slice(0, limit);

    if (limitedProducts.length > 0) {
        res.status(200).send({ message: "All products", error: false, data: limitedProducts });
    } else {
        res.send({ message: "No products found", error: true });
    }
};

module.exports.getAllProduct = getAllProduct;
