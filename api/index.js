const express = require('express')
const _ = require('lodash')

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

setup()