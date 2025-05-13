const express = require('express')
const {registerCLICommand} = require("./commandRegistrar");
const Card = require("../db/card");


let listener

const listen = async (ctx) => {
    if (listener) {
        return
    }

    const app = express()
    app.get('*', async (req, res) => {
        let cardID = req.url.split('/')[1]
        let card = await Card.findOne({cardID: cardID})
        if (!card) {
            res.status(404).send('No card with ID').end()
        }
        res.redirect(301, card.cardURL)
        res.status(200).end()
    })

    listener = app.listen(9898, () => console.log(`Listening on port 9898`))
}

module.exports = {
    listen,
}