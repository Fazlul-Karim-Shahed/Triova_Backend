

const { SubCategoryModel } = require("../../Models/SubCategoryModel")


const getSubCategoryByCategory = async (req, res) => {

    let subCategory = await SubCategoryModel.find({ categoryId: req.params.categoryId }).populate(['departmentId', 'categoryId'])

    if (subCategory.length != 0) {

        res.status(200).send({ message: 'All sub category', error: false, data: subCategory })
    }
    else {
        res.send({ message: 'No sub category found', error: true })
    }


}

module.exports.getSubCategoryByCategory = getSubCategoryByCategory