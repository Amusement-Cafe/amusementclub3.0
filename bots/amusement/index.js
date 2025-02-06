const Oceanic = require('oceanic.js')

const {
    handleBotCommand
} = require("../../utils/commandRegistrar")
const {
    fetchOrCreateUser
} = require("./helpers/user")
const {
    startup
} = require('./utils/startup')

require('./commands')
const {getContext, globalContext} = require("../../utils/ctxFiller");


const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
let started, ctx

bot.once('ready', async () => {
    ctx = await getContext()
    started = true
    let slashCommands = require('./static/commands.json')
    const globalCommands = await bot.application.getGuildCommands('651599467174428703')
    if (globalCommands.length !== slashCommands.general.length) {
        console.log('Updating global commands as a mis-match was found')
        await bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.general)
    }
})

bot.on('ready', async () => {
    await bot.editStatus('online', [{ name: 'commands', type: 2}])
    console.log('Amusement Club is Online')
})

process.on('message', async (msg) => {
    if (msg.connect) {
        await bot.connect()
    }
    if (msg.quit) {
        await bot.disconnect(false)
    }
    if (msg.send) {
        return false
    }
})


bot.on('interactionCreate', async (interaction) => {
    if (!started) {
        return interaction.reply({content: `Amusement Club is not ready to accept commands just yet!`})
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
    isolatedCtx.user = await fetchOrCreateUser(interaction)
    await handleBotCommand(base, isolatedCtx)
})