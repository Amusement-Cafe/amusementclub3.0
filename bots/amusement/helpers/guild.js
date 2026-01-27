const {
    Guilds
} = require('../../../db')

const fetchOrCreateGuild = async (ctx) => {
    let guild = await Guilds.findOne({guildID: ctx.interaction?.guildID})

    if (!guild && !ctx.interaction.guildID) {
        return 'DM'
    }

    if (!guild) {
        guild = new Guilds()
        guild.guildID = ctx.interaction.guildID
        guild.reportChannel = ctx.interaction.channelID
        guild.tomatoes = 10000
        guild.nextCheck = new Date(new Date().getTime() + ctx.hourToMS(24))
        await guild.save()
        try {
            await ctx.interaction.channel.createMessage({
                embeds: [
                    {
                        description: `${ctx.boldName(ctx.user.username)}, thank you for inviting Amusement Club to a new server! This channel has been marked for bot reports, you can change this later with \`/guild set report\` in the channel you want Amusement to post reports to.`,
                        color: ctx.colors.green
                    }
                ]
            })
        } catch (e) {}
    }

    return guild
}

const fetchGuildByID = async (ctx, guildID) => Guilds.findOne({guildID: guildID})


module.exports = {
    fetchGuildByID,
    fetchOrCreateGuild,
}