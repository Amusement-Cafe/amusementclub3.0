const Oceanic = require('oceanic.js')
const jobs = require('./utils/jobs')

const {
    handleBotCommand,
    handleReaction
} = require("../../utils/commandRegistrar")

const {
    fetchOrCreateUser
} = require("./helpers/user")

const {
    getContext,
    globalContext
} = require("../../utils/ctxFiller")

require('./commands')
require('../../utils/cfmHandler')

const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
let ctx
let wip = true

//Todo
//Replace Guild Commands with globals before release

bot.once('ready', async () => {
    ctx = await getContext()
    wip = false
    let slashCommands = require('./static/commands.json')
    const globalCommands = await bot.application.getGlobalCommands()
    const guildCommands = await bot.application.getGuildCommands(ctx.config.amusement.adminGuildID)
    if (globalCommands.length !== slashCommands.general.length) {
        console.log('Updating global commands as a mis-match was found')
        await bot.application.bulkEditGlobalCommands(slashCommands.general)
    }
    if (guildCommands.length !== slashCommands.admin.length) {
        console.log(`Updating Admin commands as a mis-match was found!`)
        await bot.application.bulkEditGuildCommands(ctx.config.amusement.adminGuildID, slashCommands.admin)
    }
    jobs.startTicks(ctx)
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
        jobs.stopTicks()
        await bot.disconnect(false)
    }
    if (msg.send) {
        return false
    }
    if (msg.ctx || msg.refreshCTX) {
        wip = true
        ctx = await getContext(true)
        wip = false
    }
})


bot.on('interactionCreate', async (interaction) => {
    if (wip || ctx.wip) {
        return interaction.reply({content: `Amusement club is currently in WIP mode, meaning updates are either ongoing or it is just starting up. Please try your command again later!`})
    }

    let base = [interaction.data.name || interaction.data.customID]
    let options = []
    let cursor = interaction.data

    if (interaction.constructor === Oceanic.ModalSubmitInteraction) {
        while (cursor.hasOwnProperty('components')) {
            cursor = cursor.components.raw? cursor.components.raw : cursor.components
            cursor.map(x => {
                if (x.type === 1 || x.type === 2) {
                    cursor = x
                } else {
                    options.push({[x.customID]: x.value})
                }
            })
        }
    } else {
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
    }

    let isolatedCtx = Object.assign({}, ctx, {
        interaction,
        bot,
        options: Object.assign({}, ...options),
        global: globalContext
    })
    isolatedCtx.user = await fetchOrCreateUser(interaction)
    switch (interaction.constructor) {
        case Oceanic.CommandInteraction:
            return await handleBotCommand(base, isolatedCtx)
        case Oceanic.ComponentInteraction:
            return await handleReaction(base, isolatedCtx)
        case Oceanic.ModalSubmitInteraction:
            return await handleReaction(base, isolatedCtx)
        default:
            return false
    }
})

bot.on('error', (err) => {console.log(err)})
process.on('uncaughtException', (err) => {console.log(err)})