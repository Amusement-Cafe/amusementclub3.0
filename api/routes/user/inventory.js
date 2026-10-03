const router = require('express').Router()

const UserInventory = require('../../../db/userInventory')

const {
    getUserInventory,
    removeItem
} = require("../../../bots/amusement/helpers/userInventory")

const {
    addUserCards
} = require("../../../bots/amusement/helpers/userCard")

router.get('/inventory', async (req, res) => {
    const inventory = await getUserInventory(req)
    return res.status(200).send(inventory).end()
})

router.delete('/inventory', async (req, res) => {
    req.webhook = true
    if (!req.body.id) {
        return res.status(400).send('Bad Request - id').end()
    }
    let removal = await removeItem(req, req.body)
    if (!removal) {
        return res.status(404).send('Item not found').end()
    }
    return res.status(200).end()
})

router.post('/inventory/use', async (req, res) => {
    const ctx = req.app.locals.ctx
    const { id } = req.body
    if (!id) {
        return res.status(400).send('Bad Request - id').end()
    }

    const item = await UserInventory.findOne({ userID: req.user.userID, id })
    if (!item) {
        return res.status(404).send('Item not found').end()
    }
    if (item.type !== 'ticket') {
        return res.status(400).send(`Items of type ${item.type} cannot be used here`).end()
    }

    const cards = drawTicketCards(ctx, item)
    if (cards.length === 0) {
        return res.status(422).send('No cards available for this ticket').end()
    }

    try {
        const removed = await UserInventory.deleteOne({ userID: req.user.userID, id })
        if (removed.deletedCount === 0) {
            return res.status(404).send('Item not found').end()
        }

        const cardIDs = cards.map(x => x.cardID)
        await addUserCards(req.user.userID, cardIDs)
        return res.status(200).send({ cards: cardIDs }).end()
    } catch (e) {
        console.error('Item use failed:', e)
        return res.status(500).send('Internal Server Error').end()
    }
})

module.exports = router