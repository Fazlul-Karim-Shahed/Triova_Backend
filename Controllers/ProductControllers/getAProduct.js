
const { ProductModel } = require("../../Models/ProductModel")


const getAProduct = async (req, res) => {

    let products = await ProductModel.findOne({ verified: true, _id: req.params.productId }).populate(['batchId', 'departmentId', 'categoryId', 'subCategoryId', 'brandId', 'subBrandId'])

    if (products.length != 0) {

        res.status(200).send({ message: 'All products', error: false, data: products })
    }
    else {
        res.send({ message: 'No products found', error: true })
    }

}

module.exports.getAProduct = getAProduct