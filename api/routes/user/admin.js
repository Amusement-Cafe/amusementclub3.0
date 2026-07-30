const router = require('express').Router()
const User = require('../../../db/user')
const { addUserCards } = require('../../../bots/amusement/helpers/userCard')
const UserInventory = require('../../../db/userInventory')
const { generateNewID } = require('../../../utils/misc')

router.use((req, res, next) => {
    if (!req.user.roles || !req.user.roles.includes('admin')) {
        return res.status(403).send('Forbidden - admin role required').end()
    }
    next()
})

router.post('/admin/balances', async (req, res) => {
    const { targetUserID, tomatoes, lemons, vials } = req.body
    if (!targetUserID) return res.status(400).send('Bad Request - targetUserID').end()
    
    const targetUser = await User.findOne({ userID: targetUserID })
    if (!targetUser) return res.status(404).send('Target user not found').end()
    
    if (tomatoes !== undefined) targetUser.tomatoes = tomatoes
    if (lemons !== undefined) targetUser.lemons = lemons
    if (vials !== undefined) targetUser.vials = vials
    
    await targetUser.save()
    return res.sendStatus(200).end()
})

router.put('/admin/card', async (req, res) => {
    const { targetUserID, cardID } = req.body
    if (!targetUserID || !cardID) return res.status(400).send('Bad Request - fields missing').end()
    
    await addUserCards(targetUserID, [cardID])
    return res.sendStatus(200).end()
})

router.post('/admin/item', async (req, res) => {
    const { targetUserID, type, itemID } = req.body
    if (!targetUserID || !type || !itemID) return res.status(400).send('Bad Request - fields missing').end()
    
    const inv = new UserInventory()
    inv.id = generateNewID()
    inv.userID = targetUserID
    inv.type = type
    inv.itemID = itemID
    inv.acquired = new Date()
    await inv.save()
    
    return res.sendStatus(200).end()
})

router.post('/admin/resetdaily', async (req, res) => {
    const { targetUserID } = req.body
    if (!targetUserID) return res.status(400).send('Bad Request - targetUserID').end()
    
    const targetUser = await User.findOne({ userID: targetUserID })
    if (!targetUser) return res.status(404).send('Target user not found').end()
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (!targetUser.streaks) {
        targetUser.streaks = {}
    }
    if (!targetUser.streaks.daily) {
        targetUser.streaks.daily = {}
    }
    
    targetUser.streaks.daily.lastReset = yesterday
    targetUser.lastDaily = yesterday
    targetUser.markModified('streaks')
    await targetUser.save()
    
    return res.sendStatus(200).end()
})

module.exports = router
