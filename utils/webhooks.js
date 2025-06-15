const express = require('express')
const Card = require("../db/card")
const Collection = require("../db/collection")


let listener

const listen = async (ctx) => {
    if (listener) {
        return
    }

    const app = express()
    app.get('/id/*', async (req, res) => {
        let cardID = req.url.split('/')[2]
        let card = await Card.findOne({cardID: cardID})
        if (!card) {
            res.status(404).send('No card with ID').end()
        }
        let collection = await Collection.findOne({collectionID: card.collectionID})
        res.redirect(301, `https://a.amu.cards/cards/${card.collectionID}/${card.rarity}_${card.cardName.replaceAll(' ', '_')}${card.animated? '.gif': collection.compressed? '.jpg': '.png'}`)
        res.status(200).end()
    })

    listener = app.listen(9898, () => console.log(`Listening on port 9898`))
}

module.exports = {
    listen,
}