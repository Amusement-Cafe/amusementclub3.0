const router = require('express').Router()
const Card = require("../../../db/card")
const Collection = require("../../../db/collection")

router.get('/id/:cardID', async (req, res) => {
    const date = new Date()
    let cardID = req.params.cardID
    if (cardID.endsWith('.jpg') || cardID.endsWith('.png') || cardID.endsWith('.gif')) {
        cardID = cardID.toString().substring(0, cardID.length - 4)
    }
    if (isNaN(Number(cardID))) {
        return res.status(501).send(`Don't be bad`).end()
    }
    let card = await Card.findOne({cardID: cardID})
    if (!card) {
        return res.status(404).send('No card with that ID').end()
    }
    let collection = await Collection.findOne({collectionID: card.collectionID})
    if (date.getDate() === 1 && date.getMonth() === 3 && date.getMinutes() % 5 === 0) {
        res.redirect(301, 'https://t.amu.cards/cards/astley.jpg')
    } else {
        res.redirect(301, `https://t.amu.cards/cards/${card.collectionID}/${card.rarity}_${card.cardName.replaceAll(' ', '_')}${card.animated? '.gif': collection.compressed? '.jpg': '.png'}`)
    }
    return res.status(200).end()
})

module.exports = router