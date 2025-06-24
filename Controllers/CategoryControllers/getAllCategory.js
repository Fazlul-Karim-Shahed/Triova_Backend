const { CategoryModel } = require("../../Models/CategoryModel")


const getAllcategory = async (req, res) => {

    let category = await CategoryModel.find().populate('departmentId')

    if (category.length != 0) {

        res.status(200).send({ message: 'All category', error: false, data: category })
    }
    else {
        res.send({ message: 'No category found', error: true })
    }


}
 
module.exports.getAllcategory = getAllcategory