const {
    trigger,
} = require('../utils/cmd')

const userq = []

const commandInteractionHandler = async (ctx, interaction) => {
    if (interaction.applicationID !== ctx.bot.application.id)
        return

    const interactionUser = interaction.user || interaction.member.user
    if (interactionUser.bot)
        return

    // const reply = (user, str, clr = 'default', edit) => send(interaction, toObj(user, str, clr), user.discord_id, [], edit)
    // let botUser = await user.fetchOnly(interactionUser.id)


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
        msg, /* current icoming msg object */
        capitalMsg,
        // reply, /* quick reply function to the channel */
        globals: {}, /* global parameters */
        discord_guild: interaction.member ? interaction.member.guild : null,  /* current discord guild */
        prefix: '/', /* current prefix */
        interaction: interaction,
        options,
        interactionUser
    })

    // let usr = await user.fetchOrCreate(isolatedCtx, interactionUser.id, interactionUser.globalName || interactionUser.username)
    // usr.username = usr.username.replace(/\*/gi, '')
    const cntnt = msg.map(x => x.trim()).join(' ').split(/ +/)

    // if (userq.some(x => x.id === interactionUser.id)) {
    //     await interaction.defer(64)
    //     return reply(botUser, 'you are currently on a command cooldown. These last only 5 seconds from your last command, please wait a moment and try your command again!', 'red')
    // }

    // userq.push({id: interactionUser.id, expires: asdate.add(new Date(), 5, 'seconds')})

    // if (ctx.settings.wip && !usr.roles.includes('admin') && !usr.roles.includes('mod')) {
    //     await interaction.defer()
    //     return reply(usr, ctx.settings.wipMsg, 'yellow')
    // }

    // if (usr.ban.full) {
    //     await interaction.defer()
    //     return reply(usr, `this account was banned permanently.
    //                     For more information please visit [bot discord](${ctx.cafe})`, 'red')
    // }
    //
    // usr.exp = Math.min(usr.exp, 10 ** 7)
    // usr.vials = Math.min(usr.vials, 10 ** 6)
    //
    // console.log(`${new Date().toLocaleTimeString()} [${usr.username}]: ${cntnt}`)
    // if (isolatedCtx.discord_guild)
    //     isolatedCtx.guild = curguild || await guild.fetchOrCreate(isolatedCtx, usr, interaction.member.guild)
    //
    // ctx.mixpanel.track('Command', {
    //     distinct_id: usr.discord_id,
    //     command: args,
    //     guild: isolatedCtx.guild ? isolatedCtx.guild.id : 'direct',
    //     options: options
    // })
    let usr = {discord_id: '123456'}
    await trigger('cmd', isolatedCtx, usr, cntnt)
    interaction.channel.createMessage({content: `This is a command interaction response, but it just responds to any command....`})
}

const componentInteractionHandler = async (ctx, interaction) => {
    interaction.channel.createMessage({content: `This is a component interaction response, but it just responds to any component....`})

}

const modalInteractionHandler = async (ctx, interaction) => {
    interaction.channel.createMessage({content: `This is a modal interaction response, but it just responds to any modal....`})
}

module.exports = {
    commandInteractionHandler,
    componentInteractionHandler,
    modalInteractionHandler,
}