const _ = require('lodash')
const {Cards} = require("../../../db")

const referencePrices = {
    1: 100,
    2: 300,
    3: 500,
    4: 5000,
    5: 20000
}

let processing = false

const evalCards = async (ctx) => {
    if (processing) {
        return
    }
    processing = true
    const start = new Date()
    const queryTime = new Date()
    queryTime.setTime(start.getTime() - (1000 * 60 * 60 * 24 * 7))
    const cards = await Cards.find({lastUpdatedEval: {$lt: queryTime}})
    if (cards.length === 0) {
        return
    }
    console.log('Attempting Card Eval Updates')
    console.log("Cards gathered, updating evals")
    await Promise.all(cards.map(async (card) => {
        if (card.lastUpdatedEval && card.lastUpdatedEval >= (Date.now() - (1000 * 60 * 60 * 24 * 7)))
            return
        console.log(`Processing card ID ${card.cardID}`)
        let price = referencePrices[card.rarity]
        let cardCollection = ctx.collections.find(x => x.collectionID === card.collectionID)
        console.log(`Processing Eval`)

        price += price * card.animated? 1.05: 1
        price *= price * cardCollection.promo? 1.1: 1


        let ageModifier = Math.log(Math.floor(((new Date() - card.added) / (1000 * 60 * 60 * 24))) + 1) * 0.25
        let totalCopiesModifier = 1 - (card.stats.totalCopies / 50) * 0.05
        let wishlistModifier = 1 + (card.stats.wishlistCount / 100) * 0.02
        let botSaleModifier = 1 - (card.stats.soldToBot / 100) * 0.05
        let ownerCountModifier = 1 + (card.ownerCount / 100) * 0.03
        let hoardRatio = card.ownerCount / card.stats.totalCopies || 1
        if (!isFinite(hoardRatio)) {
            hoardRatio = 1
        }
        price = price + (card.stats.auctionSales.reduce((acc, price) => acc + price, 0) / card.stats.auctionSales.length * 0.01 || 0)
        price = price + (card.stats.auctionReturned.reduce((acc, price) => acc + price, 0) / card.stats.auctionReturned.length * 0.015 || 0)
        price = price * ageModifier * totalCopiesModifier * wishlistModifier * botSaleModifier * ownerCountModifier * hoardRatio
        card.eval = Math.abs(Math.round(price)) || -1
        console.log(card.eval)
        card.lastUpdatedEval = Date.now()
        await card.save()
    }))

    const end = new Date()
    console.log("Finished Updating Evals")
    console.log(`Processing Started at ${start} and ended at ${end}`)
    processing = false
}

module.exports = {
    evalCards
}