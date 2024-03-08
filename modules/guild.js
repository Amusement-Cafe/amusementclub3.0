const Guilds = require('../collections/guild')
const {
    addTime
} = require("../utils/tools")

let guildCache = []

const getOrCreateGuild = async (ctx, user, discordGuild, create = false) => {
    if (!discordGuild || !discordGuild.id)
        return false

    let fromCache = true
    let guild = guildCache.find(x => x.guildID === discordGuild.id)

    if (!guild) {
        guild = await Guilds.findOne({guildID: discordGuild.id})
        fromCache = false
    }

    if (!guild && create) {
        guild = new Guilds()
        guild.guildID = discordGuild.id
        guild.reportChannel = ctx.interaction.channel.id
        guild.nextCheck = addTime(new Date(), 20, 'hours')

        try {
            await ctx.bot.rest.channels.createMessage(ctx.interaction.channel.id, {
                embeds: [
                    {
                        description: `**${user.username}**, guild initialized. This channel has been marked for reports and announcements. Use \`/help\` to learn more about the bot!`,
                        color: ctx.colors.green
                    }
                ]
            })
        } catch (e) {
            await ctx.interaction.defer()
            return ctx.reply(user, `you have attempted to initialize Amusement Club in a channel that it cannot send messages to! Amusement Club requires the ability to send messages to channels where it's commands can be run to deliver secondary information after the results of some commands. Please grant Amusement Club the ability to send messages before trying another command!`, 'red')
        }
        await guild.save()
    }

    if (!guild && !create)
        return null

    guild.cacheClear = addTime(new Date(), 4, 'hours')

    if (!fromCache)
        guildCache.push(guild)

    return guild
}

module.exports = {
    getOrCreateGuild,
}