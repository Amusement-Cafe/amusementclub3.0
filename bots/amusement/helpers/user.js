const User = require('../../../db/user')

const fetchOrCreateUser = async (interaction) => {
    let user = await User.findOne({userID: interaction.user.id})

    if (!user) {
        user = new User()
        user.userID = interaction.user.id
        user.username = interaction.user.globalName || interaction.user.username
        user.tomatoes = 5000
        user.joined = new Date()
        user.lastDaily = (new Date() - 86400001)
        await user.save()
    }

    if (user.username !== (interaction.user.globalName || interaction.user.username)) {
        user.username = interaction.user.globalName || interaction.user.username
        await user.save()
    }

    return user
}

const fetchUser = async (userID) => {
    let user = await User.findOne({userID: userID})

    if (!user) {
        return false
    }

    return user

}


const dailyReminder = async (ctx) => {
    //Add extra checks for effects here once they are re-added
    const timeForDaily = new Date(new Date().getTime() - 1000*60*60*20)
    const userToRemind = await User.findOneAndUpdate({
        'preferences.notify.daily': true,
        'lastDaily': {$lt: timeForDaily},
        'dailyNotified': false}, {dailyNotified: true}, {returnDocument: "after"})

    if (!userToRemind) {
        return
    }
    try {
        await ctx.sendDM(ctx, userToRemind, {
            title: 'Daily Ready!',
            description: `you can claim your daily bonus now with \`/daily\`!`,
            color: ctx.colors.blue
        }, ctx.colors.blue)
    } catch (e) {
        console.log(`Unable to send daily reminder to ${userToRemind.username}: ${e}`)
    }

}

module.exports = {
    dailyReminder,
    fetchOrCreateUser,
    fetchUser
}