const {
    GuildUsers
} = require('../../../db')

const fetchOrCreateGuildUser = async (ctx) => {
    let guildUser = await GuildUsers.findOne({ guildId: ctx.guild.guildID, userID: ctx.user.userID })
    if (!guildUser) {
        guildUser = new GuildUsers()
        guildUser.userID = ctx.user.userID
        guildUser.guildID = ctx.guild.guildID
        await guildUser.save()
    }
    return guildUser
}

const fetchGuildUser = async (ctx, guildID, userID) => GuildUsers.findOne({guildID: guildID || ctx.guild.guildID, userID: userID || ctx.user.userID})

const fetchAllGuildUsers = async (ctx) => GuildUsers.find({guildID: ctx.guild.guildID})

module.exports = {
    fetchAllGuildUsers,
    fetchGuildUser,
    fetchOrCreateGuildUser,
}