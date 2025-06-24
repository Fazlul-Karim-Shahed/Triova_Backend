

const { SubCategoryModel } = require("../../Models/SubCategoryModel")


const getASubCategory = async (req, res) => {

    let SubCategory = await SubCategoryModel.findOne({ _id: req.params.subCategoryId }).populate(['departmentId', 'categoryId'])

    if (SubCategory) {

        res.status(200).send({ message: 'Sub category found', error: false, data: SubCategory })
    }
    else {
        res.send({ message: 'No sub category found', error: true })
    }

}

module.exports.getASubCategory = getASubCategory