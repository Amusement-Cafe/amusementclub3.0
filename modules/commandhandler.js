const _ = require('lodash')

const {
    trigger,
} = require('../utils/cmd')

const {
    fetchOrCreateUser
} = require('./user')

const {
    interactions
} = require('../utils/globalarrays')

const userq = []
const pastSelects = []


const commandInteractionHandler = async (ctx, interaction, user) => {
    if (interaction.applicationID !== ctx.bot.application.id)
        return


    // const reply = (user, str, clr = 'default', edit) => send(interaction, toObj(user, str, clr), user.discord_id, [], edit)
    const reply = (user, str, clr = 'default', edit = false) => ctx.send(isolatedCtx, user, {
        embed: ctx.toObj(user, str, ctx.colors[clr]),
        edit: options.edit || false,
        parent: options.parent || false,
        buttons: options.buttons || [],
        select: options.select || [],
        permissions: {interact: [user.userid], select: [user.userid]}
    })


    // const curguild = await guild.fetchGuildById(interaction.guildID)

    let substring = interaction.data.name === 'sudo'? interaction.data.name: interaction.data.name.substring(2)
    let base = [substring]
    let options = []

    let cursor = interaction.data
    while (cursor.hasOwnProperty('options')) {
        cursor = cursor.options.raw? cursor.options.raw : cursor.options
        cursor.map(x => {
            if (x.type === 1 || x.type === 2) {
                base.push(x.name)
                cursor = x
            } else if ((x.name === 'global' && x.value) || (x.name === 'local' && x.value)) {
                base.push(x.name)
            } else {
                options.push(x)
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
        discord_guild: interaction.member ? interaction.member.guild : null,  /* current discord guild */
        interaction: interaction,
        options
    })

    // usr.username = usr.username.replace(/\*/gi, '')
    const cntnt = msg.map(x => x.trim()).join(' ').split(/ +/)

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
    console.log(`${new Date().toLocaleTimeString()} [${user.username}]: ${cntnt.join(' ')}`)
    // if (isolatedCtx.discord_guild)
    //     isolatedCtx.guild = curguild || await guild.fetchOrCreate(isolatedCtx, usr, interaction.member.guild)
    //
    // ctx.mixpanel.track('Command', {
    //     distinct_id: usr.discord_id,
    //     command: args,
    //     guild: isolatedCtx.guild ? isolatedCtx.guild.id : 'direct',
    //     options: options
    // })
    await trigger('cmd', isolatedCtx, user, cntnt)
}

const componentInteractionHandler = async (ctx, interaction) => {
    let idsplit = interaction.data.customID.split('_')
    let selection
    let activeInteraction = interactions.find(x => x.msgID === interaction.message.id)
    if (!activeInteraction) {
        const old = await ctx.bot.rest.channels.getMessage(interaction.message.channelID, interaction.message.id)
        await old.edit({embeds: old.embeds, content: old.content, components: []})
        await interaction.defer(64)
        return await interaction.createFollowup({content: 'The message you tried to interact with has expired!'})
    }

    if (interaction.data.componentType === 3) {
        idsplit = [interaction.data.customID, interaction.data.values.raw[0]]
        if (interactions.find(x => x.msgID === interaction.message.id)?.perms?.pages?.indexOf(interaction.user.id) < 0) {
            await interaction.defer(64)
            return interaction.createFollowup({content: 'You are not allowed to interact with this menu.'})
        }
        _.remove(pastSelects, (x) => x.msgID === interaction.message.id)
        pastSelects.push({discord_id: interaction.user.id, selection: interaction.data.values.raw[0], msgID: interaction.message.id})
    } else {

        if (interactions.find(x => x.msgID === interaction.message.id)?.perms?.interact?.indexOf(interaction.user.id) < 0) {
            await interaction.defer(64)
            return interaction.createFollowup({content: 'You are not allowed to interact with this message.'})
        }
        selection = pastSelects.find(x => x.msgID === interaction.message.id)
    }

    let interactionUser = interaction.user || interaction.member.user
    let botUser = await fetchOrCreateUser(ctx, interactionUser)
    const reply = (user, str, clr = 'default', options) => ctx.send(isolatedCtx, user,
        {
            embed: ctx.toObj(user, str, ctx.colors[clr]),
            edit: options.edit || false,
            parent: options.parent || false,
            buttons: options.buttons || [],
            select: options.select || [],
            perms: {interact: [interactionUser.id], select: [interactionUser.id]}
        })
    const isolatedCtx = Object.assign({}, ctx, {
        discord_guild: interaction.member ? interaction.member.guild : null,  /* current discord guild */
        interaction,
        id: idsplit.splice(1),
        selection,
        reply
    })

    await trigger('rct', isolatedCtx, botUser, [idsplit.shift()])

}

const modalInteractionHandler = async (ctx, interaction) => {
    interaction.channel.createMessage({content: `This is a modal interaction response, but it just responds to any modal....`})
}

module.exports = {
    commandInteractionHandler,
    componentInteractionHandler,
    modalInteractionHandler,
    pastSelects,
}