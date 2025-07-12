const { ProductModel } = require("../../Models/ProductModel");
const algoliasearch = require("algoliasearch");

const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const algoliaIndex = algoliaClient.initIndex("products");

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        const product = await ProductModel.deleteOne({ _id: productId });

        if (product.deletedCount !== 0) {
            // Also delete from Algolia
            await algoliaIndex.deleteObject(productId);

            return res.status(200).send({ message: "Product deleted successfully", error: false });
        } else {
            return res.status(404).send({ message: "No product found", error: true });
        }
    } catch (error) {
        console.error("❌ Error deleting product:", error.message);
        return res.status(500).send({ message: "Internal server error", error: true });
    }
};

module.exports.deleteProduct = deleteProduct;
