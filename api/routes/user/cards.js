const router = require('express').Router()
const _ = require('lodash')

const {
    addUserCards,
    getUserCardsLean,
    removeUserCards,
} = require("../../../bots/amusement/helpers/userCard")

router.get('/cards', async (req, res) => {
    let cards = await getUserCardsLean(null, req.user.userID)
    if (req.body.cards && _.isArray(req.body.cards)) {
        cards = cards.filter(card => req.body.cards.includes(card.cardID))
    }
    return res.status(200).send(cards).end()
})

router.put('/cards', async (req, res) => {
    if (!req.body.cards || !_.isArray(req.body.cards)) {
        return res.status(400).send('Bad Request - cards').end()
    }
    await addUserCards(req.user.userID, req.body.cards)
    return res.sendStatus(200).end()
})

router.delete('/user/cards', async (req, res) => {
    if (!req.body.cards || !_.isArray(req.body.cards)) {
        return res.status(400).send('Bad Request - cards').end()
    }
    await removeUserCards(req.user.userID, req.body.cards)
    return res.sendStatus(200).end()
})

module.exports = router