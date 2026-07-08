const router = require('express').Router()

router.use(require('./cards'))
router.use(require('./inventory'))
router.use(require('./preferences'))

module.exports = router