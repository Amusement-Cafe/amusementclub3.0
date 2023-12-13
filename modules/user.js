const Users = require('../collections/user')
// const {
//     Users
// } = require('../collections')

const fetchOrCreateUser = async (ctx, interactionuser) => {
    let user = await Users.findOne({userid: interactionuser.id})
    let display = interactionuser.globalName || interactionuser.username

    if (!user) {
        user = await new Users()
        user.userid = interactionuser.id
        user.username = display
        user.tomatoes = 1
        user.joined = new Date()
        user.lastdaily = (new Date() - 86400000)
        await user.save()
    }

    if (user.username !== display) {
        user.username = display
        await user.save()
    }

    return user
}

module.exports = {
    fetchOrCreateUser
}