const {
    Guilds
} = require('../../../db')

const fetchOrCreateGuild = async (ctx) => {
    let guild = await Guilds.findOne({guildID: ctx.interaction?.guildID})

    if (!guild && !ctx.interaction.guildID) {
        return 'DM'
    }

    if (guild && !guild.ownerID) {
        guild.ownerID = (await ctx.bot.rest.guilds.get(ctx.interaction.guildID)).ownerID
        await guild.save()
    }

    if (!guild) {
        guild = new Guilds()
        guild.guildID = ctx.interaction.guildID
        guild.reportChannel = ctx.interaction.channelID
        guild.tomatoes = 10000
        guild.nextCheck = new Date(new Date().getTime() + ctx.hourToMS(24))
        guild.ownerID = (await ctx.bot.rest.guilds.get(ctx.interaction.guildID)).ownerID
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

const updateGuildInvites = async (ctx) => {
    let now = new Date()
    let guildToUpdate = await Guilds.find({adminLock: true, $or: [{lastUpdatedInvite: {$lt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)}}, {invite: ''}]})
    for (let guilds of guildToUpdate) {
        if (guilds.guildID !== '529023217491247105') {
            continue
        }
        let guild = await ctx.bot.rest.guilds.get(guilds.guildID)
        let invite
        if (guild.vanityURLCode) {
            invite = {code: guild.vanityURLCode}
        } else {
            invite = await ctx.bot.rest.channels.createInvite(guilds.reportChannel, {maxAge: 60 * 60 * 24 * 7, reason: 'Rotating invites for admin locked servers', temporary: false, unique: true})
        }
        guilds.invite = invite.code
        guilds.lastUpdatedInvite = now
        await guilds.save()
    }
}

module.exports = {
    fetchGuildByID,
    fetchOrCreateGuild,
    updateGuildInvites,
}