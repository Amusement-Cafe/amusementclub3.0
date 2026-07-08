const express = require('express')
const _ = require('lodash')

const {
    getUserInventory,
    removeItem
} = require("../bots/amusement/helpers/userInventory")

const {
    getUserCardsLean,
    addUserCards
} = require("../bots/amusement/helpers/userCard")

const {
    getContext
} = require("../utils/ctxFiller")

const publicRoutes = require('./routes/public')
const globalRoutes = require('./routes/global')
const userRoutes = require('./routes/user')

const auth = require('./middleware/auth')
const user = require('./middleware/user')

let app, listener, ctx

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

process.on('message', async (msg) => {
    if (msg.listen) {
        while (!app) {
            await sleep(100)
        }
        listener = app.listen(9898, () => console.log(`Listening on port 9898`))
    }
    if (msg.quit) {
        listener.close()
        process.exit(0)
    }
    if (msg.refreshCTX) {
        ctx = await getContext()
        app.locals.ctx = ctx
    }
})

const setup = async () => {
    ctx = await getContext()
    app = express()
    app.locals.ctx = ctx
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    app.use('/', publicRoutes)

    app.use(await auth)

    app.use('/global', globalRoutes)

    app.use(await user)

    app.use('/user', userRoutes)
}



const listen = async (ctx) => {
    if (listener) {
        return
    }

    const app = express()


    app.delete('/user/cards', async (req, res) => {
        if (!req.body.cards || !_.isArray(req.body.cards)) {
            return res.status(400).send('Bad Request - cards').end()
        }
        console.log(req.body)
        // await addUserCards(req.user.userID, req.body.cards)
        return res.status(200).end()
    })

    listener = app.listen(9898, () => console.log(`Listening on port 9898`))
}

setup()