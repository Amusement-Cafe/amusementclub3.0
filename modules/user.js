const Users = require('../collections/user')


const fetchOrCreateUser = async (ctx, interactionuser) => {
    let user = await Users.findOne({userID: interactionuser.id})
    let display = interactionuser.globalName || interactionuser.username

    if (!user) {
        user = await new Users()
        user.userID = interactionuser.id
        user.username = display
        user.tomatoes = 1
        user.joined = new Date()
        user.lastdaily = (new Date() - 86400000)
        await user.save()

        welcomeUser(ctx, user)

    }

    if (user.username !== display) {
        user.username = display
        await user.save()
    }

    return user
}

const welcomeUser = async (ctx, user) => {
    await ctx.direct(ctx, user, 'Hi, this is the welcome user DM. It only fires on creation!', 'blue').catch(e => {
        console.log(e)
    })
}

module.exports = {
    fetchOrCreateUser
}