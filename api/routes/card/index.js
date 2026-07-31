const router = require('express').Router()
const card = require('../../middleware/card')

const setup = async () => {
    router.use(await card)
    router.use(require('./eval'))
}
setup()
module.exports = router