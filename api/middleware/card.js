module.exports = async (req, res, next) => {
    if (!req.query.cardID) {
        return res.status(400).send('Bad Request - card ID').end()
    }
    req.card = req.app.locals.ctx.cards.find(x => x.cardID == req.query.cardID)
    if (!req.card) {
        return res.status(404).send('Card not found').end()
    }
    await next()
}