

const { CategoryModel } = require("../../Models/CategoryModel")


const getACategory = async (req, res) => {

    let category = await CategoryModel.findOne({ _id: req.params.categoryId }).populate('departmentId')

    if (category) {

        res.status(200).send({ message: 'Category found', error: false, data: category })
    }
    else {
        res.send({ message: 'No category found', error: true })
    }



}

module.exports.getACategory = getACategory