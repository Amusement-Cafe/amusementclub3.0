const _ = require('lodash')

const {
    trigger,
} = require('../utils/cmd')

const {
    interactions
} = require('../utils/globalarrays')

const {
    getOrCreateGuild,
} = require('./guild')

const userq = []
const pastSelects = []


const commandInteractionHandler = async (ctx, interaction, user) => {
    if (interaction.applicationID !== ctx.bot.application.id)
        return

    /**
     *
     * @param user
     * @param str
     * @param clr
     * @param args
     * @returns {*}
     */
    const reply = (user, str, clr = 'default', args) => ctx.send(isolatedCtx, user, {
        embed: ctx.toObj(user, str, ctx.colors[clr]),
        edit: args?.edit || false,
        parent: args?.parent || false,
        buttons: args?.buttons || [],
        select: args?.select || [],
        perms: {pages: [user.userID], cfm: [user.userID], dcl: [user.userID]},
    })


    // const curguild = await guild.fetchGuildById(interaction.guildID)

    let base = [interaction.data.name]
    let options = []

    let cursor = interaction.data
    while (cursor.hasOwnProperty('options')) {
        cursor = cursor.options.raw? cursor.options.raw : cursor.options
        cursor.map(x => {
            if (x.type === 1 || x.type === 2) {
                base.push(x.name)
                cursor = x
            } else if (x.name === 'global' && x.value) {
                base.push(x.name)
            } else {
                options.push({[x.name]: x.value})
            }
        })
    }

    let capitalMsg = base
    let msg = base.map(x => x.toLowerCase())
    const isolatedCtx = Object.assign({}, ctx, {
        msg, /* lowercase slash command args */
        capitalMsg,
        reply, /* quick reply function to the channel */
        globals: {}, /* global parameters */
        discordGuild: interaction.member?.guildID? await ctx.bot.guilds.get(interaction.member.guildID) : false,  /* current discord guild */
        interaction: interaction,
        options: _.assign({}, ...options),
        command: msg.map(x => x.trim()).join(' ').split(/ +/),
        warnDM: () => reply(user, `this command can only be used in a discord guild!`, 'red')
    })

    // usr.username = usr.username.replace(/\*/gi, '')

    if (userq.some(x => x.id === user.userid)) {
        await interaction.defer(64)
        return reply(user, 'you are currently on a command cooldown. These last only 5 seconds from your last command, please wait a moment and try your command again!', 'red')
    }

    // userq.push({id: interactionUser.id, expires: addTime(new Date(), 5, 'seconds')})

    if (ctx.settings.wip && !user.roles.includes('admin') && !user.roles.includes('mod')) {
        await interaction.defer()
        return reply(user, ctx.settings.wipMsg, 'yellow')
    }

    if (user.ban.full) {
        await interaction.defer()
        return reply(user, `this account was banned permanently.
                        For more information please visit [bot discord](${ctx.cafe})`, 'red')
    }

    // usr.exp = Math.min(usr.exp, 10 ** 7)
    // usr.vials = Math.min(usr.vials, 10 ** 6)
    //
    console.log(`${new Date().toLocaleTimeString()} [${user.username}]: ${isolatedCtx.command.join(' ')}`)

    ctx.analytics.capture({
        distinctId: user.userID,
        event: "command",
        properties: {
            main: base.join(" "),
            options: isolatedCtx.options
        }
    })
    if (isolatedCtx.discordGuild)
        isolatedCtx.botGuild = await getOrCreateGuild(isolatedCtx, user, isolatedCtx.discordGuild, true)

    if (isolatedCtx.discordGuild === null)
        return
    //
    // ctx.mixpanel.track('Command', {
    //     distinct_id: usr.discord_id,
    //     command: args,
    //     guild: isolatedCtx.guild ? isolatedCtx.guild.id : 'direct',
    //     options: options
    // })

    await trigger('cmd', isolatedCtx, user, isolatedCtx.command)
}

const componentInteractionHandler = async (ctx, interaction, user) => {
    let idSplit = interaction.data.customID.split('_')
    let selection
    let activeInteraction = interactions.find(x => x.msgID === interaction.message.id)
    if (!activeInteraction) {
        const old = await ctx.bot.rest.channels.getMessage(interaction.message.channelID, interaction.message.id)
        await old.edit({embeds: old.embeds, content: old.content, components: []})
        await interaction.defer(64)
        return await interaction.createFollowup({content: 'The message you tried to interact with has expired!'})
    }

    if (interaction.data.componentType === 3) {
        idSplit = [interaction.data.customID, interaction.data.values.raw[0]]
        if (interactions.find(x => x.msgID === interaction.message.id)?.permissions?.pages?.indexOf(interaction.user.id) < 0) {
            await interaction.defer(64)
            return interaction.createFollowup({content: 'You are not allowed to interact with this menu.'})
        }
        _.remove(pastSelects, (x) => x.msgID === interaction.message.id)
        pastSelects.push({userID: interaction.user.id, selection: interaction.data.values.raw[0], msgID: interaction.message.id})
    } else {

        if (interactions.find(x => x.msgID === interaction.message.id)?.permissions?.interact?.indexOf(interaction.user.id) < 0) {
            await interaction.defer(64)
            return interaction.createFollowup({content: 'You are not allowed to interact with this message.'})
        }
        selection = pastSelects.find(x => x.msgID === interaction.message.id)
    }

    /**
     *
     * @param user
     * @param str
     * @param clr
     * @param args
     * @returns {*}
     */
    const reply = (user, str, clr = 'default', args) => ctx.send(isolatedCtx, user,
        {
            embed: ctx.toObj(user, str, ctx.colors[clr]),
            edit: args.edit || false,
            parent: args.parent || false,
            buttons: args.buttons || [],
            select: args.select || [],
            perms: {pages: [user.userID], cfm: [user.userID], dcl: [user.userID]},
        })
    const isolatedCtx = Object.assign({}, ctx, {
        discordGuild: interaction.member?.guildID? await ctx.bot.guilds.get(interaction.member.guildID) : false,  /* current discord guild */
        interaction,
        id: idSplit.splice(1),
        selection,
        reply
    })

    await trigger('rct', isolatedCtx, user, [idSplit.shift()])

}

const modalInteractionHandler = async (ctx, interaction, user) => {
    let idSplit = interaction.data.customID.split('_')
    const selection = pastSelects.find(x => x.msgID === interaction.message.id)
    const reply = (user, str, clr = 'default', args) => ctx.send(isolatedCtx, user,
        {
            embed: ctx.toObj(user, str, ctx.colors[clr]),
            edit: args.edit || false,
            parent: args.parent || false,
            buttons: args.buttons || [],
            select: args.select || [],
            perms: {pages: [user.userID], cfm: [user.userID], dcl: [user.userID]},
        })

    let options = []

    interaction.data.components.raw.map(x => {
        if (x.type === 1)
            x.components.map(y => {
                options.push({[y.customID]: y.value})
            })
        else
            options.push({[x.customID]: x.value})
    })

    const isolatedCtx = Object.assign({}, ctx, {
        discordGuild: interaction.member?.guildID? await ctx.bot.guilds.get(interaction.member.guildID) : false,  /* current discord guild */
        interaction,
        id: idSplit.splice(1),
        options: _.assign({}, ...options),
        selection,
        reply
    })

    await trigger('mod', isolatedCtx, user, [idSplit.shift()])
}

module.exports = {
    commandInteractionHandler,
    componentInteractionHandler,
    modalInteractionHandler,
    pastSelects,
}