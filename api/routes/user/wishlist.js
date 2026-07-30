const router = require('express').Router()
const UserWishlist = require('../../../db/userWishlist')

router.post('/wishlist', async (req, res) => {
    const { cardID } = req.body
    if (!cardID) return res.status(400).send('Bad Request - cardID').end()
    
    const existing = await UserWishlist.findOne({ userID: req.user.userID, cardID: String(cardID) })
    if (existing) return res.status(409).send('Already wishlisted').end()
    
    await UserWishlist.create({
        userID: req.user.userID,
        cardID: String(cardID),
        added: new Date()
    })
    return res.sendStatus(200).end()
})

router.delete('/wishlist', async (req, res) => {
    const { cardID } = req.body
    if (!cardID) return res.status(400).send('Bad Request - cardID').end()
    
    const result = await UserWishlist.deleteOne({ userID: req.user.userID, cardID: String(cardID) })
    if (result.deletedCount === 0) return res.status(404).send('Wishlist entry not found').end()
    return res.sendStatus(200).end()
})

module.exports = router
