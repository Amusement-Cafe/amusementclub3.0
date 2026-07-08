module.exports = async (req, res, next) => {
    const ctx = req.app.locals.ctx

    if (req.headers.authorization !== ctx.config.webhooks.auth) {
        return res.status(403).send('Forbidden')
    }

    await next()
}