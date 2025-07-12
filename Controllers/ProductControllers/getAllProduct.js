require("dotenv").config(); // Ensure environment variables are loaded

const { ProductModel } = require("../../Models/ProductModel");
const { DepartmentModel } = require("../../Models/DepartmentModel");
const { CategoryModel } = require("../../Models/CategoryModel");
const { SubCategoryModel } = require("../../Models/SubCategoryModel");
const { SubBrandModel } = require("../../Models/SubBrandModel");
const { BrandModel } = require("../../Models/BrandModel");

const algoliasearch = require("algoliasearch"); // ✅ Correct default import
const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const getAllProduct = async (req, res) => {
    try {
        let searchParams = { ...req.body };

        if (searchParams.max || searchParams.min) searchParams.sellingPrice = {};

        if (searchParams.department) {
            const d = await DepartmentModel.findOne({ name: searchParams.department });
            if (d) searchParams.departmentId = d._id;
            delete searchParams.department;
        }

        if (searchParams.category) {
            const c = await CategoryModel.findOne({ name: searchParams.category });
            if (c) searchParams.categoryId = c._id;
            delete searchParams.category;
        }

        if (searchParams.subcategory) {
            const sc = await SubCategoryModel.findOne({ name: searchParams.subcategory });
            if (sc) searchParams.subCategoryId = sc._id;
            delete searchParams.subcategory;
        }

        if (searchParams.subbrand) {
            const sb = await SubBrandModel.findOne({ name: searchParams.subbrand });
            if (sb) searchParams.subBrandId = sb._id;
            delete searchParams.subbrand;
        }

        if (searchParams.brand) {
            const b = await BrandModel.findOne({ name: searchParams.brand });
            if (b) searchParams.brandId = b._id;
            delete searchParams.brand;
        }

        if (searchParams.color) {
            searchParams.colors = { $elemMatch: { color: searchParams.color } };
            delete searchParams.color;
        }

        if (searchParams.size) {
            searchParams.sizes = { $elemMatch: { size: searchParams.size } };
            delete searchParams.size;
        }

        if (searchParams.min) {
            searchParams.sellingPrice.$gte = parseFloat(searchParams.min);
            delete searchParams.min;
        }

        if (searchParams.max) {
            searchParams.sellingPrice.$lte = parseFloat(searchParams.max);
            delete searchParams.max;
        }

        const keyword = searchParams.search;
        delete searchParams.search;

        const isValidSearch = typeof keyword === "string" && keyword.trim() !== "";
        const baseFilter = { ...searchParams };

        let allProducts = [];

        if (isValidSearch) {
            const cleanKeyword = keyword.trim();

            // console.log("Searching Algolia for:", cleanKeyword);

            const result = await algoliaIndex.search(cleanKeyword, {
                hitsPerPage: 100,
                attributesToRetrieve: ["objectID"],
            });

            const ids = result.hits.map((hit) => hit.objectID);
            // console.log("Algolia search returned IDs:", ids);

            if (ids.length === 0) {
                return res.status(200).send({ message: "No products found", error: true, data: [] });
            }

            baseFilter._id = { $in: ids };
        }

        allProducts = await ProductModel.find(baseFilter).populate(["batchId", "departmentId", "categoryId", "subCategoryId", "brandId", "subBrandId"]).lean();

        allProducts.sort((a, b) => b.stock - a.stock);

        const limit = parseInt(req.query.limit) || allProducts.length;
        const limitedProducts = allProducts.slice(0, limit);

        if (limitedProducts.length > 0) {
            res.status(200).send({ message: "All products", error: false, data: limitedProducts });
        } else {
            res.status(200).send({ message: "No products found", error: true, data: [] });
        }
    } catch (err) {
        console.error("Error in getAllProduct:", err);
        res.status(500).json({ message: "Error searching products", error: true, details: err.message });
    }
};

module.exports.getAllProduct = getAllProduct;
