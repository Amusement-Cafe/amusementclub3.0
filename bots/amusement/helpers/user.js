const User = require('../../../db/user')

const fetchOrCreateUser = async (interaction) => {
    let user = await User.findOne({userID: interaction.user.id})

    if (!user) {
        user = new User()
        user.userID = interaction.user.id
        user.username = interaction.user.globalName || interaction.user.username
        user.tomatoes = 1
        user.joined = new Date()
        user.lastDaily = (new Date() - 86400001)
        await user.save()

        //Todo branch off to a new user tutorial and invalidate original command
        
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

module.exports = {
    fetchOrCreateUser,
    fetchUser
}