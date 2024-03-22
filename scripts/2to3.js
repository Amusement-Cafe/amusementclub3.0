/*
So much DB stuff....

cards out of json into DB
collections out of json into DB
 */
const mongoose = require("mongoose")

const {
    Cards,
    Collections,
    Promos
} = require('../collections')

const oldCards = require('../../ayano/data/cards.json')
const oldCollections = require('../../ayano/data/collections.json')
const oldPromos = require('../../ayano/data/promos.json')
const oldBoosts = require('../../ayano/data/boosts.json')



const dbTemp = require('./dbtemp.json')


const main = async () => {
    const mcn = await mongoose.connect(dbTemp.db)
    await senkoTransfer()
}

const senkoTransfer = async () => {
    console.log('Beginning Card Transfer')
    await Promise.all(oldCards.map(async (x, i) => {
        const newCard = new Cards()
        newCard.cardID = x.id
        newCard.level = x.level
        newCard.animated = x.animated
        newCard.collectionID = x.col
        newCard.cardName = x.name
        if (x.displayName)
            newCard.displayName = x.displayName
        await newCard.save()
        console.log(`Processing card #${i}/${oldCards.length}`)
    }))
    console.log('Finished Card Transfer')
    console.log('Beginning Collection Transfer')
    await Promise.all(oldCollections.map(async (x, i) => {
        const newCollection = new Collections()
        newCollection.collectionID = x.id
        newCollection.name = x.name
        newCollection.origin = x.origin
        newCollection.aliases = x.aliases
        newCollection.promo = x.promo
        newCollection.compressed = x.compressed
        newCollection.creatorID = x.author
        newCollection.dateAdded = x.dateAdded
        if (x.rarity)
            newCollection.rarity = x.rarity
        await newCollection.save()
        console.log(`Processing collection #${i}/${oldCollections.length}`)
    }))
    console.log('Finished Collection Transfer')
    console.log('Beginning Promo Transfer')
    await Promise.all(oldPromos.map(async (x, i) => {
        const newPromo = new Promos()
        newPromo.promoID = x.id
        newPromo.name = x.name
        newPromo.currency = x.currency
        newPromo.starts = new Date(x.starts)
        newPromo.expires = new Date(x.expires)
        newPromo.collectionID = x.id
        await newPromo.save()
        console.log(`Processing promo #${i}/${oldPromos.length}`)
    }))
    console.log('Finished Promo Transfer')
    console.log('Beginning Boost Transfer')
    await Promise.all(oldBoosts.map(async (x, i) => {
        const newPromo = new Promos()
        newPromo.promoID = x.id
        newPromo.name = x.name
        newPromo.starts = new Date(x.starts)
        newPromo.expires = new Date(x.expires)
        newPromo.isBoost = true
        newPromo.cards = x.cards
        newPromo.rate = x.rate
        await newPromo.save()
        console.log(`Processing boost #${i}/${oldBoosts.length}`)
    }))
    process.exit()
}

main()