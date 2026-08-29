const router = require('express').Router()
const Auction = require('../../../db/auction')
const User = require('../../../db/user')
const mongoose = require('mongoose')

router.post('/auction/bid', async (req, res) => {
    const { auctionID, amount } = req.body
    if (!auctionID || amount === undefined) {
        return res.status(400).send('Bad Request - missing fields').end()
    }
    
    try {
        const auction = await Auction.findOne({ auctionID })
        if (!auction) {
            return res.status(404).send('Auction not found').end()
        }
        
        if (auction.ended || auction.cancelled) {
            return res.status(409).send('Auction ended or cancelled').end()
        }
        
        if (amount <= auction.highBid) {
            return res.status(400).send('Bid too low').end()
        }
        
        if (req.user.tomatoes < amount) {
            return res.status(402).send('Insufficient tomatoes').end()
        }
        
        if (auction.lastBidderID) {
            await User.updateOne({ userID: auction.lastBidderID }, { $inc: { tomatoes: auction.highBid } })
        }
        
        req.user.tomatoes -= amount
        await req.user.save()
        
        let newPrice = auction.highBid > 0 ? auction.highBid + 1 : auction.price
        if (newPrice > amount) newPrice = amount
        
        auction.price = newPrice
        auction.highBid = amount
        auction.lastBidderID = req.user.userID
        auction.bids.push({ user: req.user.userID, bid: amount, time: new Date() })
        await auction.save()
        
        return res.sendStatus(200).end()
    } catch (e) {
        console.error('Auction bid failed:', e)
        return res.status(500).send('Internal Server Error').end()
    }
})

module.exports = router
