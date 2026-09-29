const router = require('express').Router()
const { generateNewID } = require('../../../utils/misc')
const UserInventory = require('../../../db/userInventory')
const UserStats = require('../../../db/userStats')
const mongoose = require('mongoose')

// Keep in sync with the /store command (bots/amusement/commands/store.js)
const ticketLimit = 3

router.post('/store/purchase', async (req, res) => {
    const { itemID } = req.body
    if (!itemID) return res.status(400).send('Bad Request - itemID').end()
    
    const ctx = req.app.locals.ctx || req.locals?.ctx
    const item = ctx.items[itemID]
    if (!item) return res.status(404).send('Item not found').end()
    
    const cost = item.cost > 1 ? item.cost : 1000
    const currency = item.type === 'recipe' ? 'tomatoes' : 'lemons'
    if (req.user[currency] < cost) {
        return res.status(402).send(`Insufficient ${currency}`).end()
    }

    const statsFilter = { userID: req.user.userID, daily: req.user.lastDaily }
    const typeStat = `store${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`

    try {
        // Make sure today's stats document exists, then reserve a ticket slot
        // with a conditional increment so parallel requests cannot exceed the limit
        await UserStats.updateOne(statsFilter, { $setOnInsert: statsFilter }, { upsert: true })

        if (item.type === 'ticket') {
            const reserved = await UserStats.updateOne(
                { ...statsFilter, storeTicket: { $not: { $gte: ticketLimit } } },
                { $inc: { store: 1, storeTicket: 1 } }
            )
            if (reserved.modifiedCount === 0) {
                return res.status(429).send(`Daily ticket purchase limit reached (${ticketLimit})`).end()
            }
        }

        req.user[currency] -= cost
        await req.user.save()
        
        const inv = new UserInventory()
        inv.id = generateNewID()
        inv.userID = req.user.userID
        inv.itemID = itemID
        inv.type = item.type
        inv.acquired = new Date()
        await inv.save()

        if (item.type !== 'ticket') {
            await UserStats.updateOne(statsFilter, { $inc: { store: 1, [typeStat]: 1 } })
        }
        
        return res.sendStatus(200).end()
    } catch (e) {
        console.error('Store failed:', e)
        return res.status(500).send('Internal Server Error').end()
    }
})

module.exports = router
