const { createDepartment } = require('../Controllers/DepartmentControllers/createDepartment')
const { deleteDepartment } = require('../Controllers/DepartmentControllers/deleteDepartment')
const { getAllDepartment } = require('../Controllers/DepartmentControllers/getAllDepartment')
const { updateDepartment } = require('../Controllers/DepartmentControllers/updateDepartment')
const { roleCheck } = require('../Middlewares/roleCheck')





const router = require('express').Router()

router.post('/get', getAllDepartment)
router.post('/', roleCheck(['admin']), createDepartment)
router.put('/:departmentId', roleCheck(['admin']), updateDepartment)
router.delete('/:departmentId', roleCheck(['admin']), deleteDepartment)

module.exports = router