
const { createBatch } = require('../Controllers/BatchControllers/createBatch')
const { getAllBatch } = require('../Controllers/BatchControllers/getAllBatches')
const { roleCheck } = require('../Middlewares/roleCheck')


const router = require('express').Router()


router.get('/', getAllBatch)
router.post('/', roleCheck(['admin']), createBatch)


module.exports = router