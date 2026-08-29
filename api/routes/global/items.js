const router = require('express').Router()

router.get('/items', async (req, res) => res.status(200).send(req.app.locals.ctx.items).end())

module.exports = router
