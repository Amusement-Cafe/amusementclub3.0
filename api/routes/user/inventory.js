const router = require('express').Router()

const {
    getUserInventory,
    removeItem
} = require("../../../bots/amusement/helpers/userInventory")

router.get('/inventory', async (req, res) => {
    const inventory = await getUserInventory(req)
    return res.status(200).send(inventory).end()
})

router.delete('/inventory', async (req, res) => {
    req.webhook = true
    if (!req.body.id) {
        return res.status(400).send('Bad Request - id').end()
    }
    let removal = await removeItem(req, req.body)
    if (!removal) {
        return res.status(404).send('Item not found').end()
    }
    return res.status(200).end()
})


module.exports = router