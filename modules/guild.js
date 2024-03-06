const Guilds = require('../collections/guild')

let guildCache = []

const fetchOrCreateGuild = async (ctx, user, guild) => {
    if (!guild || !guild.id)
        return null


}

const fetchGuildByID = async (guildID) => {
    let guild = guildCache.find(x => x.id === guildID)
    let fromCache = true
    if (!guild) {
        guild = await Guilds.findOne({guildID: guildID})
    }
    return guild
}

module.exports = {
    fetchGuildByID,
    fetchOrCreateGuild,
}