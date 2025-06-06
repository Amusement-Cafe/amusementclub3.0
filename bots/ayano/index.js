const Oceanic = require('oceanic.js')

const {
    handleBotCommand,
    registerBotCommand,
    handleReaction,
} = require("../../utils/commandRegistrar")

const {
    listen
} = require("../../utils/webhooks")


require('./commands')
require('../../utils/cfmHandler')

const User = require("../../db/user");
const {getContext, globalContext} = require("../../utils/ctxFiller");

const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token, gateway: { intents: ["MESSAGE_CONTENT", "GUILD_MESSAGES", "DIRECT_MESSAGES"]}})

let ctx = {}

process.on('message', async (msg) => {
    if (msg.connect)
        await bot.connect()
    if (msg.quit)
        await bot.disconnect(false)
    if (msg.send)
        return
    if (msg.ctx)
        ctx = await getContext('ayano')
})

let ready = false

//Todo Add guild ID to config
bot.once('ready', async () => {
    ctx = await getContext('ayano')
    let slashCommands = require('./static/commands.json')
    const serverCommands = await bot.application.getGuildCommands('651599467174428703')
    if (serverCommands.length !== slashCommands.commands.length) {
        console.log('Updating server commands as a mis-match was found')
        await bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.commands)
    }
    await listen(ctx)
    ready = true
})

bot.on('ready', async () => {
    await bot.editStatus('online', [{ name: 'over you', type: 3}])
    console.log('Ayano is online')
})

bot.on('messageCreate', async (msg) => {
    const lowerMessage = msg.content.toLowerCase()

    if(lowerMessage.trim() === 'ayy')
        return bot.rest.channels.createMessage(msg.channelID, {content: 'lmao'})
})

bot.on('interactionCreate', async (interaction) => {
    if (!ready) {
        return interaction.reply({content:`Ayano is not yet ready to handle commands.`})
    }
    let base = [interaction.data.name || interaction.data.customID]
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
    let isolatedCtx = Object.assign({}, ctx, {
        interaction,
        bot,
        options: Object.assign({}, ...options),
        global: globalContext
    })
    isolatedCtx.user = await User.findOne({userID: interaction.user.id})

    switch (interaction.constructor) {
        case Oceanic.CommandInteraction:
            return await handleBotCommand(base, isolatedCtx)
        case Oceanic.ComponentInteraction:
            return await handleReaction(base, isolatedCtx)
        case Oceanic.ModalSubmitInteraction:
            return
        default:
            return false
    }

})

bot.on('error', (err) => console.log(err))
process.on('uncaughtException', (exc) => console.log(exc))

registerBotCommand(['restart', 'ayano'], async (ctx) => {
    await ctx.interaction.reply({content: 'restarting'})
    process.send({restart: true})
})