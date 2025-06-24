
const { signin } = require('../Controllers/AuthControllers/signin')
const { signup } = require('../Controllers/AuthControllers/signup')


const router = require('express').Router()

router.post('/signin', signin)
router.post('/signup', signup)

module.exports = router