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
        if (isNaN(Number(cardID))) {
            return res.status(501).send(`Don't be bad`).end()
        }
        let card = await Card.findOne({cardID: cardID})
        if (!card) {
            res.status(404).send('No card with that ID').end()
        }
        let collection = await Collection.findOne({collectionID: card.collectionID})
        res.redirect(301, `https://a.amu.cards/cards/${card.collectionID}/${card.rarity}_${card.cardName.replaceAll(' ', '_')}${card.animated? '.gif': collection.compressed? '.jpg': '.png'}`)
        return res.status(200).end()
    })

    app.get('/cards', async (req, res) => {
        if (req.headers.authorization !== ctx.config.webhooks.auth) {
            return res.status(403).send('Forbidden\r\n').end()
        }
        return res.status(200).send(ctx.cards).end()
    })

    app.get('/collections', async (req, res) => {
        if (req.headers.authorization !== ctx.config.webhooks.auth) {
            return res.status(403).send('Forbidden\r\n').end()
        }
        return res.status(200).send(ctx.collections).end()
    })

    app.get('/test', async (req, res) => {

        return res.send(`${Math.floor(process.uptime())}`).end()
    })

    listener = app.listen(9898, () => console.log(`Listening on port 9898`))
}

module.exports = {
    listen,
}