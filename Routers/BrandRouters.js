const { createBrand } = require('../Controllers/BrandControllers/createBrand')
const { deleteBrand } = require('../Controllers/BrandControllers/deleteBrand')
const { getABrand } = require('../Controllers/BrandControllers/getABrand')
const { getAllBrand } = require('../Controllers/BrandControllers/getAllBrand')
const { getBrandByCategory } = require('../Controllers/BrandControllers/getBrandBycategory')
const { updateBrand } = require('../Controllers/BrandControllers/updateBrand')
const { roleCheck } = require('../Middlewares/roleCheck')


const router = require('express').Router()

router.get('/', getAllBrand)
router.get('/:brandId', getABrand)
router.get('/category/:categoryId', getBrandByCategory)
router.post('/', roleCheck(['admin']), createBrand)
router.put('/:brandId', roleCheck(['admin']), updateBrand)
router.delete('/:brandId', roleCheck(['admin']), deleteBrand)

module.exports = router