const router = require('express').Router()
const _ = require('lodash')

const {
    addUserCards,
    getUserCardsLean,
    removeUserCards,
} = require("../../../bots/amusement/helpers/userCard")

router.patch('/cards/fav', async (req, res) => {
    const { cardID } = req.body
    if (cardID === undefined) return res.status(400).send('Bad Request - cardID').end()
    
    const UserCards = require('../../../db/userCard')
    const userCard = await UserCards.findOne({ userID: req.user.userID, cardID: Number(cardID) })
    if (!userCard) return res.status(404).send('Card not found in collection').end()
    
    userCard.fav = !userCard.fav
    await userCard.save()
    return res.status(200).json({ fav: userCard.fav }).end()
})

router.patch('/cards/edit', async (req, res) => {
    const allowedRoles = ['metamod', 'tagmod', 'admin']
    if (!req.user.roles || !req.user.roles.some(r => allowedRoles.includes(r.toLowerCase()))) {
        return res.status(403).send('Forbidden - editor role required').end()
    }

    const { cardID, displayName, meta, tagsToAdd, tagsToRemove } = req.body
    if (cardID === undefined) return res.status(400).send('Bad Request - cardID').end()

    const Card = require('../../../db/card')
    const Tag = require('../../../db/tag')

    const card = await Card.findOne({ cardID: Number(cardID) })
    if (!card) return res.status(404).send('Card not found').end()

    if (displayName !== undefined) {
        card.displayName = displayName
    }

    if (meta) {
        if (!card.meta) card.meta = {}
        for (const [key, value] of Object.entries(meta)) {
            card.meta[key] = value
        }
        card.markModified('meta')
    }

    await card.save()

    if (tagsToRemove && Array.isArray(tagsToRemove) && tagsToRemove.length > 0) {
        await Tag.deleteMany({ cardID: Number(cardID), tagName: { $in: tagsToRemove } })
    }

    if (tagsToAdd && Array.isArray(tagsToAdd) && tagsToAdd.length > 0) {
        const tagDocs = tagsToAdd.map(tagName => ({
            cardID: Number(cardID),
            tagName,
            status: 'clear',
            userID: req.user.userID,
            upvotes: [],
            downvotes: []
        }))
        await Tag.insertMany(tagDocs)
    }

    return res.sendStatus(200).end()
})

router.get('/cards', async (req, res) => {
    let cards = await getUserCardsLean(null, req.user.userID)
    if (req.body.cards && _.isArray(req.body.cards)) {
        cards = cards.filter(card => req.body.cards.includes(card.cardID))
    }
    return res.status(200).send(cards).end()
})

router.put('/cards', async (req, res) => {
    if (!req.user.roles || !req.user.roles.includes('admin')) {
        return res.status(403).send('Forbidden - admin role required').end()
    }
    if (!req.body.cards || !_.isArray(req.body.cards)) {
        return res.status(400).send('Bad Request - cards').end()
    }
    await addUserCards(req.user.userID, req.body.cards)
    return res.sendStatus(200).end()
})

router.delete('/cards', async (req, res) => {
    if (!req.user.roles || !req.user.roles.includes('admin')) {
        return res.status(403).send('Forbidden - admin role required').end()
    }
    if (!req.body.cards || !_.isArray(req.body.cards)) {
        return res.status(400).send('Bad Request - cards').end()
    }
    await removeUserCards(req.user.userID, req.body.cards)
    return res.sendStatus(200).end()
})

module.exports = router