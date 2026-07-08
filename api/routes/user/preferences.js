const router = require('express').Router()
const _ = require('lodash')

router.get('/preferences', async (req, res) => res.status(200).send(req.user.preferences).end())

router.patch('/preferences', async (req, res) => {
    const {preferences} = req.body
    if (!preferences) {
        return res.status(400).send('Bad Request - preferences').end()
    }
    req.user.preferences = _.merge(req.user.preferences, preferences)
    await req.user.save()
    return res.status(200).end()
})

module.exports = router