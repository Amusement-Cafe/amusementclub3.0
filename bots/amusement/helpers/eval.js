// This is an AI assisted portion of the code
// I suck at conceptualizing and implementing the math ideas I had for eval
// 100% willing to accept PRs to replace this with something human written
// That follows the same general modifications


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

const timeMultiplier = (card, now = Date.now()) => {
    const days = (now - new Date(card.added).getTime()) / 86400000

    // ---- Tunables ----
    const earlyPeak = 1.15          // brand-new boost
    const midDip = 0.85             // lowest dip
    const latePeak = 5.0            // max long-term multiplier

    const earlyDecayCenter = 60     // ~2 months
    const earlyDecaySharpness = 0.05

    const lateRiseCenter = 900      // ~2.5 years
    const lateRiseSharpness = 0.004
    // ------------------

    // Early decay: 1.15 → 0.85
    const earlyDecay =
        midDip +
        (earlyPeak - midDip) /
        (1 + Math.exp(earlyDecaySharpness * (days - earlyDecayCenter)))

    // Late rise: 1.0 → 5.0
    const lateRise =
        1 +
        (latePeak - 1) /
        (1 + Math.exp(-lateRiseSharpness * (days - lateRiseCenter)))

    return earlyDecay * lateRise
}

const hoardingMultiplier = (card) => {
    if (card.stats.totalCopies <= 0 || card.ownerCount <= 0) return 1

    const hoardedRatio = Math.max(
        0,
        Math.min(1, 1 - card.ownerCount / card.stats.totalCopies)
    )

    // ---- Tunables ----
    const maxBonus = 2.0
    const strength = 3
    // ------------------

    return 1 + (maxBonus - 1) * Math.log1p(strength * hoardedRatio) / Math.log1p(strength)
}

const supplyDilutionMultiplier = (card) => {
    if (card.stats.totalCopies <= 1) return 1

    // ---- Tunables ----
    const maxPenalty = 0.10
    const scale = 200
    // ------------------

    const penalty =
        maxPenalty * Math.log1p(card.stats.totalCopies) / Math.log1p(scale)

    return 1 - Math.min(maxPenalty, penalty)
}

const auctionSalesMultiplier = (card, referencePrice) => {
    if (!card.stats.auctionSales?.length) return 1

    const avg =
        card.stats.auctionSales.reduce((s, a) => s + a.cost, 0) /
        card.stats.auctionSales.length

    if (avg <= referencePrice) return 1

    // ---- Tunables ----
    const maxBonus = 1.75
    const strength = 1.5
    // ------------------

    const ratio = avg / referencePrice

    return 1 + (maxBonus - 1) * Math.log1p(strength * (ratio - 1)) / Math.log1p(strength)
}

const soldToBotMultiplier = (card) => {
    if (!card.stats.soldToBot?.length) return 1

    const botCount = card.stats.soldToBot.length
    const marketCount = card.stats.auctionSales?.length || 0

    const ratio = botCount / (botCount + marketCount)

    // ---- Tunables ----
    const maxPenalty = 0.4
    // ------------------

    return 1 - maxPenalty * ratio
}

const auctionReturnedMultiplier = (card, currentEval) => {
    if (!card.stats.auctionReturned?.length) return 1

    const relevantFails = card.stats.auctionReturned.filter(
        a => a.cost <= currentEval * 1.5
    ).length

    if (!relevantFails) return 1

    // ---- Tunables ----
    const maxPenalty = 0.25
    const scale = 5
    // ------------------

    return 1 - maxPenalty * Math.log1p(relevantFails) / Math.log1p(scale)
}



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
        let basePrice = referencePrices[card.rarity]
        let price = basePrice
        let cardCollection = ctx.collections.find(x => x.collectionID === card.collectionID)
        console.log(`Processing Eval`)

        price *= card.animated ? 1.10 : 1.0
        price *= !card.canDrop || cardCollection.promo? 1.75 : 1.0
        price *= timeMultiplier(card)
        price *= hoardingMultiplier(card)
        price *= supplyDilutionMultiplier(card)
        price *= auctionSalesMultiplier(card, basePrice)
        price *= soldToBotMultiplier(card)
        price *= card.stats.wishlistCount? 1 + 0.15 * Math.log1p(card.stats.wishlistCount) / Math.log1p(50): 1
        price *= auctionReturnedMultiplier(card, price)
        price = Math.max(price, basePrice * 0.5)

        card.eval = Math.abs(Math.round(price)) || -1
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