const Users = require('../collections/user')


const fetchOrCreateUser = async (ctx, interactionUser) => {
    let user = await Users.findOne({userID: interactionUser.id})
    let display = interactionUser.globalName || interactionUser.username

    if (!user) {
        user = new Users()
        user.userID = interactionUser.id
        user.username = display
        user.tomatoes = 1
        user.joined = new Date()
        user.lastDaily = (new Date() - 86400001)
        await user.save()

        welcomeUser(ctx, user)

    }

    if (user.username !== display) {
        user.username = display
        await user.save()
    }

    return user
}

const fetchUser = async (userID) => Users.findOne({userID: userID})

const welcomeUser = async (ctx, user) => {
    await ctx.direct(ctx, user, 'Hi, this is the welcome user DM. It only fires on creation!', 'blue').catch(e => {
        console.log(e)
    })
}

module.exports = {
    fetchOrCreateUser,
    fetchUser,
}