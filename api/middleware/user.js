const {
    fetchUser
} = require("../../bots/amusement/helpers/user")

module.exports = async (req, res, next) => {
    if (!req.query.user) {
        return res.status(400).send('Bad Request - user').end()
    }
    const user = await fetchUser(req.query.user)
    if (!user) {
        return res.status(404).send('User not found').end()
    }
    req.user = user
    await next()
}