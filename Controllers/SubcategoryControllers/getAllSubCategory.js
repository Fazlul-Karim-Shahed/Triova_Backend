
const { SubCategoryModel } = require("../../Models/SubCategoryModel")


const getAllSubCategory = async (req, res) => {

    let subCategory = !req.body ? await SubCategoryModel.find().populate(['departmentId', 'categoryId']) : await SubCategoryModel.find(req.body).populate(['departmentId', 'categoryId'])

    if (subCategory.length != 0) {

        res.status(200).send({ message: 'All sub category', error: false, data: subCategory })
    }
    else {
        res.send({ message: 'No sub category found', error: true })
    }


}

module.exports.getAllSubCategory = getAllSubCategory