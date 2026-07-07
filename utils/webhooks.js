const express = require('express')
const _ = require('lodash')
const Card = require("../db/card")
const Collection = require("../db/collection")
const {
    fetchUser
} = require("../bots/amusement/helpers/user")
const {
    getUserInventory,
    removeItem
} = require("../bots/amusement/helpers/userInventory")


let listener

const listen = async (ctx) => {
    if (listener) {
        return
    }

    const app = express()
    // Public routes go here
    app.get('/id/*', async (req, res) => {
        const date = new Date()
        let cardID = req.url.split('/')[2]
        if (cardID.endsWith('.jpg') || cardID.endsWith('.png') || cardID.endsWith('.gif')) {
            cardID = cardID.toString().substring(0, cardID.length - 4)
        }
        if (isNaN(Number(cardID))) {
            return res.status(501).send(`Don't be bad`).end()
        }
        let card = await Card.findOne({cardID: cardID})
        if (!card) {
            res.status(404).send('No card with that ID').end()
        }
        let collection = await Collection.findOne({collectionID: card.collectionID})
        if (date.getDate() === 1 && date.getMonth() === 3 && date.getMinutes() % 5 === 0) {
            res.redirect(301, 'https://t.amu.cards/cards/astley.jpg')
        } else {
            res.redirect(301, `https://t.amu.cards/cards/${card.collectionID}/${card.rarity}_${card.cardName.replaceAll(' ', '_')}${card.animated? '.gif': collection.compressed? '.jpg': '.png'}`)
        }
        return res.status(200).end()
    })

    app.get('/health', async (req, res) => {
        return res.status(200).end()
    })

    //Routes that require auth go below this function
    app.use(async function (req, res, next) {
        if (req.headers.authorization !== ctx.config.webhooks.auth) {
            return res.status(403).send('Forbidden\r\n').end()
        }
        await next()
    })

    app.get('/cards', async (req, res) => {
        return res.status(200).send(ctx.cards).end()
    })

    app.get('/collections', async (req, res) => {
        return res.status(200).send(ctx.collections).end()
    })

    app.get('/items', async (req, res) => {
        return res.status(200).send(ctx.items).end()
    })

    //Routes requiring a user go below here
    app.use(async function (req, res, next) {
        if (!req.query.user) {
            return res.status(400).send('Bad Request - user').end()
        }
        const user = await fetchUser(req.query.user)
        if (!user) {
            return res.status(404).send('User not found').end()
        }
        req.user = user
        await next()
    })

    app.use(express.json())

    app.get('/preferences', async (req, res) => {
        return res.status(200).send(req.user.preferences).end()
    })

    app.patch('/preferences', async (req, res) => {
        const {preferences} = req.body
        if (!preferences) {
            return res.status(400).send('Bad Request - preferences').end()
        }
        req.user.preferences = _.merge(req.user.preferences, preferences)
        await req.user.save()
        return res.status(200).end()
    })

    app.get('/inventory', async (req, res) => {
        const inventory = await getUserInventory(req)
        return res.status(200).send(inventory).end()
    })

    app.delete('/inventory', async (req, res) => {
        req.webhook = true
        if (!req.query.id) {
            return res.status(400).send('Bad Request - id').end()
        }
        let removal = await removeItem(req, req.query)
        if (!removal) {
            return res.status(404).send('Item not found').end()
        }
        return res.status(200).end()
    })

    listener = app.listen(9898, () => console.log(`Listening on port 9898`))
}

module.exports = {
    listen,
}