const router = require('express').Router()
const Plot = require('../../../db/plot')

router.post('/plots/collect', async (req, res) => {
    const { guildID } = req.body
    if (!guildID) return res.status(400).send('Bad Request - guildID').end()
    
    const plots = await Plot.find({ userID: req.user.userID, guildID })
    let totalCollected = 0
    
    for (const plot of plots) {
        if (plot.building && plot.building.storedLemons > 0) {
            totalCollected += plot.building.storedLemons
            plot.building.storedLemons = 0
            await plot.save()
        }
    }
    
    if (totalCollected > 0) {
        req.user.lemons += totalCollected
        await req.user.save()
    }
    
    return res.status(200).json({ collected: totalCollected }).end()
})

module.exports = router
