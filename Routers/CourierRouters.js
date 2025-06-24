


const { createCourier } = require('../Controllers/CourierController/createCourier')
const { getAllCourier } = require('../Controllers/CourierController/getAllCourier')
const { roleCheck } = require('../Middlewares/roleCheck')


const router = require('express').Router()


router.get('/', getAllCourier)
router.post('/', roleCheck(['admin']), createCourier)


module.exports = router