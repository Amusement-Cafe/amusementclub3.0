const router = require('express').Router()

router.get('/cards', async (req, res) => res.status(200).send(req.locals.ctx.cards).end())

module.exports = router