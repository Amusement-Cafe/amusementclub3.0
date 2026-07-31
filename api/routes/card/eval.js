const router = require('express').Router()

router.get('/eval', async (req, res) => res.status(200).send(`${req.card.eval}`).end())
module.exports = router