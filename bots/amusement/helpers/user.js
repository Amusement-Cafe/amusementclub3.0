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