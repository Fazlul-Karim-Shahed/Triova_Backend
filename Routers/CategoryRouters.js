const { roleCheck } = require('../Middlewares/roleCheck')
const { createCategory } = require('../Controllers/CategoryControllers/createCategory')
const { getAllcategory } = require('../Controllers/CategoryControllers/getAllCategory')
const { updateCategory } = require('../Controllers/CategoryControllers/updateCategory')
const { deleteCategory } = require('../Controllers/CategoryControllers/deleteCategory')
const { getACategory } = require('../Controllers/CategoryControllers/getACategory')

const router = require('express').Router()

router.get('/', getAllcategory)
router.get('/:categoryId', getACategory)
router.post('/', roleCheck(['admin']), createCategory)
router.put('/:categoryId', roleCheck(['admin']), updateCategory)
router.delete('/:categoryId', roleCheck(['admin']), deleteCategory)

module.exports = router