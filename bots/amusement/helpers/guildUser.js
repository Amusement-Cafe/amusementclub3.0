const {
    GuildUsers
} = require('../../../db')

const fetchOrCreateGuildUser = async (ctx) => {
    let guildUser = await GuildUsers.findOne({ guildId: ctx.guild.guildID, userID: ctx.user.userID })
}

const fetchGuildUser = async (ctx) => {}

const fetchAllGuildUsers = async (ctx) => GuildUsers.find({guildID: ctx.guild.guildID})

module.exports = {
    fetchAllGuildUsers,
    fetchGuildUser,
    fetchOrCreateGuildUser,
}