


const { createProduct } = require('../Controllers/ProductControllers/createProduct')
const { deleteProduct } = require('../Controllers/ProductControllers/deleteProduct')
const { getAllProduct } = require('../Controllers/ProductControllers/getAllProduct')
const { getAProduct } = require('../Controllers/ProductControllers/getAProduct')
const { updateProduct } = require('../Controllers/ProductControllers/updateProduct')
const { roleCheck } = require('../Middlewares/roleCheck')


const router = require('express').Router()


router.post('/get', getAllProduct)
router.get('/:productId', getAProduct)
router.put('/:productId', roleCheck(['admin']), updateProduct)
router.delete('/:productId', deleteProduct)
router.post('/', roleCheck(['admin']), createProduct)


module.exports = router