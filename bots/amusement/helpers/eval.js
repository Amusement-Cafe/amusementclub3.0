const _ = require('lodash')
const {Cards} = require("../../../db");

const referencePrices = {
    1: 100,
    2: 300,
    3: 500,
    4: 5000,
    5: 20000
}

const evalCards = async (ctx) => {
    console.log('Attempting Card Eval Updates\nGathering Cards....')
    const cards = await Cards.find()
    console.log("Cards gathered, updating evals")
    await Promise.all(cards.map(async (card) => {
        if (card.lastUpdatedEval && card.lastUpdatedEval >= (Date.now() - (1000 * 60 * 60 * 24 * 7)))
            return
        let price = referencePrices[card.rarity]
        let cardCollection = ctx.collections.find(x => x.collectionID === card.collectionID)

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
        // card.lastUpdatedEval = Date.now()
        await card.save()
    }))

    console.log("Finished Updating Evals")

}

const rarities = [1, 2, 3, 4, 5]
const totalCopies = [1, 100, 600, 250, 1000, 0]
const ownerCount = [1, 50, 200, 100, 0, 500]
const soldToBot = [0, 1, 500, 5000, 100]
const wishlistedCount = [0, 500, 1, 50, 5000, 100]
const dates = [new Date("2017-12-25"), new Date("2019-05-15"), new Date("2020-09-18"), new Date("2025-03-12"), new Date("2023-07-07")]


// for (let i = 0; i < 20; i++) {
//     let card = {
//         rarity: _.sample(rarities),
//         promo: Math.round(Math.random()),
//         animated: Math.round(Math.random()),
//         added: _.sample(dates),
//         stats: {
//             ownerCount: _.sample(ownerCount),
//             soldToBot: _.sample(soldToBot),
//             totalCopies: _.sample(totalCopies),
//             wishlistedCount: _.sample(wishlistedCount),
//         }
//     }
//     let eval = evalCard(null, card)
//     console.log(eval)
//     console.log(card)
//     console.log('\n\n\n')
// }

// const price = calculateCardPrice(cardData);
// console.log(price); // This will calculate the price based on the new data
module.exports = {
    evalCards
}