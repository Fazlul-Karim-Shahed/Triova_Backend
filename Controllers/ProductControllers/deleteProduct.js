

const { ProductModel } = require("../../Models/ProductModel")


const deleteProduct = async (req, res) => {


    let product = await ProductModel.deleteOne({ _id: req.params.productId })

    if (product.deletedCount != 0) {

        res.status(200).send({ message: 'Product deleted successfully', error: false })
    }
    else {
        res.send({ message: 'No product found', error: true })
    }

}

module.exports.deleteProduct = deleteProduct