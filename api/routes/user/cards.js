const router = require('express').Router()

const {
    addUserCards,
    getUserCardsLean,
} = require("../../../bots/amusement/helpers/userCard")

router.get('/cards', async (req, res) => {
    const cards = await getUserCardsLean(null, req.user.userID)
    return res.status(200).send(cards).end()
})

router.put('/cards', async (req, res) => {
    if (!req.body.cards || !_.isArray(req.body.cards)) {
        return res.status(400).send('Bad Request - cards').end()
    }
    await addUserCards(req.user.userID, req.body.cards)
    return res.status(200).end()
})

router.delete('/user/cards', async (req, res) => {
    return res.sendStatus(501).end()
})

module.exports = router