const router = require('express').Router()

router.get('/collections', async (req, res) => res.status(200).send(req.locals.ctx.collections).end())


module.exports = router