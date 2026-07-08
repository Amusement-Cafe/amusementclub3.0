const router = require('express').Router()

router.get('/items', async (req, res) => res.status(200).send(req.locals.ctx.items).end())

module.exports = router