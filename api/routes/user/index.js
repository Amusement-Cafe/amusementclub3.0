const router = require('express').Router()

router.use(require('./cards'))
router.use(require('./inventory'))
router.use(require('./preferences'))
router.use(require('./balances'))
router.use(require('./wishlist'))
router.use(require('./auction'))
router.use(require('./hero'))
router.use(require('./plots'))
router.use(require('./store'))
router.use(require('./claim'))
router.use(require('./admin'))

module.exports = router