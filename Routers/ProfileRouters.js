const { getAProfile } = require('../Controllers/ProfileController/getAProfile')


const router = require('express').Router()


router.get('/:role/:id', getAProfile)
// router.post('/', roleCheck(['admin']), createBatch)


module.exports = router