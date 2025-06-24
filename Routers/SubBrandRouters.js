const { createSubBrand } = require('../Controllers/SubBrandControllers/createSubBrand')
const { deleteSubBrand } = require('../Controllers/SubBrandControllers/deleteSubBrand')
const { getAllSubBrand } = require('../Controllers/SubBrandControllers/getAllSubBrand')
const { getASubBrand } = require('../Controllers/SubBrandControllers/getASubBrand')
const { getSubBrandByCategory } = require('../Controllers/SubBrandControllers/getSubBrandByCategory')
const { updateSubBrand } = require('../Controllers/SubBrandControllers/updateSubBrand')
const { roleCheck } = require('../Middlewares/roleCheck')




const router = require('express').Router()

router.get('/', getAllSubBrand)
router.get('/:subBrandId', getASubBrand)
router.get('/category/:categoryId', getSubBrandByCategory)
router.post('/', roleCheck(['admin']), createSubBrand)
router.put('/:subBrandId', roleCheck(['admin']), updateSubBrand)
router.delete('/:subBrandId', roleCheck(['admin']), deleteSubBrand)

module.exports = router