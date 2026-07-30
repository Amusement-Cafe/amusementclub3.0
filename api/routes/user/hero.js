const router = require('express').Router()

router.patch('/hero', async (req, res) => {
    const { heroID } = req.body
    if (!heroID) return res.status(400).send('Bad Request - heroID').end()
    
    req.user.hero = heroID
    req.user.heroChanged = new Date()
    await req.user.save()
    
    return res.sendStatus(200).end()
})

module.exports = router
