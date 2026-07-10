const router = require('express').Router()

router.post('/tomatoes', async (req, res) => {
    const {amount} = req.body
    if (!amount) {
        return res.status(400).send('Bad Request - amount').end()
    }
    req.user.tomatoes += amount
    await req.user.save()
    return res.sendStatus(200).end()
})

router.post('/lemons', async (req, res) => {
    const {amount} = req.body
    if (!amount) {
        return res.status(400).send('Bad Request - amount').end()
    }
    req.user.lemons += amount
    await req.user.save()
    return res.sendStatus(200).end()
})

router.post('/promo', async (req, res) => {
    const {amount} = req.body
    if (!amount) {
        return res.status(400).send('Bad Request - amount').end()
    }
    req.user.promoBal += amount
    await req.user.save()
    return res.sendStatus(200).end()
})

module.exports = router