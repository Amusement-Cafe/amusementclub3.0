const router = require('express').Router()

router.use(require('./cards'))
router.use(require('./inventory'))
router.use(require('./preferences'))
router.use(require('./balances'))

module.exports = router