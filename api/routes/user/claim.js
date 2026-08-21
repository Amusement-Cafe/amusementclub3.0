const router = require('express').Router()
const UserStats = require('../../../db/userStats')
const Card = require('../../../db/card')
const Collection = require('../../../db/collection')
const Promo = require('../../../db/promo')
const Claims = require('../../../db/claim')
const { generateNewID } = require('../../../utils/misc')
const mongoose = require('mongoose')
const UserCard = require('../../../db/userCard')

router.post('/claim', async (req, res) => {
    const { bannerID, amount } = req.body
    if (!bannerID || !amount || amount < 1 || amount > 10) {
        return res.status(400).send('Bad Request - bannerID and valid amount required').end()
    }
    
    const isPromo = bannerID !== 'standard'
    const userStats = await UserStats.findOne({ userID: req.user.userID, daily: req.user.lastDaily })
    
    const base = isPromo ? 25 : 50
    let claimCount = 0
    if (userStats) {
        claimCount = isPromo ? (userStats.promoClaims || 0) : (userStats.claims || 0)
    }
    
    let price = 0
    let tempClaims = claimCount
    for (let i = 0; i < amount; i++) {
        tempClaims++
        price += tempClaims * base
    }
    
    if (req.user.tomatoes < price) {
        return res.status(402).send('Insufficient tomatoes').end()
    }
    
    let cardsPool = []
    if (isPromo) {
        const promo = await Promo.findOne({ promoID: bannerID })
        if (promo && promo.isBoost && promo.cardIDs && promo.cardIDs.length > 0) {
            cardsPool = await Card.find({ cardID: { $in: promo.cardIDs } }).distinct('cardID')
        } else {
            cardsPool = await Card.find({ collectionID: bannerID }).distinct('cardID')
        }
    } else {
        const promoColIds = await Collection.find({ promo: true }).distinct('collectionID')
        cardsPool = await Card.find({ collectionID: { $nin: promoColIds }, rarity: { $in: [1, 2, 3, 4, 5] } }).distinct('cardID')
    }
    
    if (cardsPool.length === 0) {
        return res.status(400).send('No cards in pool').end()
    }
    
    const drawn = []
    for (let i = 0; i < amount; i++) {
        drawn.push(cardsPool[Math.floor(Math.random() * cardsPool.length)])
    }
    
    try {
        req.user.tomatoes -= price
        await req.user.save()
        
        const newClaimCount = claimCount + amount
        if (userStats) {
            if (isPromo) {
                userStats.promoClaims = newClaimCount
            } else {
                userStats.claims = newClaimCount
            }
            await userStats.save()
        } else {
            const newStats = new UserStats()
            newStats.userID = req.user.userID
            newStats.daily = req.user.lastDaily
            if (isPromo) {
                newStats.promoClaims = newClaimCount
            } else {
                newStats.claims = newClaimCount
            }
            await newStats.save()
        }
        
        const claim = new Claims()
        claim.claimID = generateNewID()
        claim.userID = req.user.userID
        claim.cardIDs = drawn
        claim.promo = isPromo
        claim.timeClaimed = new Date()
        claim.cost = price
        await claim.save()
        
        const writes = drawn.map((id) => {
            return {
                updateOne: {
                    filter: {
                        userID: req.user.userID,
                        cardID: id
                    },
                    update: {
                        $inc: {amount: 1}
                    },
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            }
        })
        await UserCard.bulkWrite(writes)
        
        return res.status(200).json({ cards: drawn, cost: price, claimID: claim.claimID }).end()
    } catch (e) {
        console.error('Claim failed:', e)
        return res.status(500).send('Internal Server Error').end()
    }
})

module.exports = router
