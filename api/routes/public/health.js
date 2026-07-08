const router = require('express').Router()

router.get('/health', (req, res) => res.sendStatus(200).end())

module.exports = router