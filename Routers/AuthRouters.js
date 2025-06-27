
const { getAllAdmin } = require('../Controllers/AuthControllers/getAllAdmin')
const { signin } = require('../Controllers/AuthControllers/signin')
const { signup } = require('../Controllers/AuthControllers/signup')
const { roleCheck } = require('../Middlewares/roleCheck')


const router = require('express').Router()

router.post('/signin', signin)
router.post('/signup', signup)
router.get("/", roleCheck(["admin"]), getAllAdmin );

module.exports = router