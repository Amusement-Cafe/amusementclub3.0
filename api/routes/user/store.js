const router = require('express').Router()
const { generateNewID } = require('../../../utils/misc')
const UserInventory = require('../../../db/userInventory')
const UserStats = require('../../../db/userStats')
const mongoose = require('mongoose')

router.post('/store/purchase', async (req, res) => {
    const { itemID } = req.body
    if (!itemID) return res.status(400).send('Bad Request - itemID').end()
    
    const ctx = req.app.locals.ctx || req.locals?.ctx
    const item = ctx.items[itemID]
    if (!item) return res.status(404).send('Item not found').end()
    
    const cost = item.cost > 1 ? item.cost : 1000
    if (req.user.tomatoes < cost) {
        return res.status(402).send('Insufficient tomatoes').end()
    }
    
    const session = await mongoose.startSession()
    session.startTransaction()
    
    try {
        req.user.tomatoes -= cost
        await req.user.save({ session })
        
        const inv = new UserInventory()
        inv.id = generateNewID()
        inv.userID = req.user.userID
        inv.itemID = itemID
        inv.type = item.type
        inv.acquired = new Date()
        await inv.save({ session })
        
        const updateObj = { store: 1 }
        updateObj[`store${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`] = 1
        
        await UserStats.updateOne(
            { userID: req.user.userID },
            { $inc: updateObj },
            { upsert: true, session }
        )
        
        await session.commitTransaction()
        session.endSession()
        
        return res.sendStatus(200).end()
    } catch (e) {
        await session.abortTransaction()
        session.endSession()
        console.error('Store transaction failed:', e)
        return res.status(500).send('Internal Server Error').end()
    }
})

module.exports = router
