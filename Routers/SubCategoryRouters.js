const { createSubCategory } = require('../Controllers/SubcategoryControllers/createSubCategory')
const { deleteSubCategory } = require('../Controllers/SubcategoryControllers/deleteSubCategory')
const { getAllSubCategory } = require('../Controllers/SubcategoryControllers/getAllSubCategory')
const { getASubCategory } = require('../Controllers/SubcategoryControllers/getASubCategory')
const { getSubCategoryByCategory } = require('../Controllers/SubcategoryControllers/getSubCategoryByCategory')
const { updateSubCategory } = require('../Controllers/SubcategoryControllers/updateSubCategory')
const { roleCheck } = require('../Middlewares/roleCheck')




const router = require('express').Router()

router.post('/get', getAllSubCategory)
router.get('/:subCategoryId', getASubCategory)
router.get('/category/:categoryId', getSubCategoryByCategory)
router.post('/', roleCheck(['admin']), createSubCategory)
router.put('/:subCategoryId', roleCheck(['admin']), updateSubCategory)
router.delete('/:subCategoryId', roleCheck(['admin']), deleteSubCategory)

module.exports = router