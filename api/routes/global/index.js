const router = require('express').Router()

router.use(require('./cards'))
router.use(require('./collections'))
router.use(require('./items'))

module.exports = router