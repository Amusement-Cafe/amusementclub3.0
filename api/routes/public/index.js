const router = require('express').Router()

router.use(require('./health'))
router.use(require('./cardID'))

module.exports = router