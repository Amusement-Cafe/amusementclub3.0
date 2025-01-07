const Oceanic = require('oceanic.js')

const {
    getDBConnection,
} = require("../../utils/dbConnection")
const {
    handleAmusementCommand
} = require("../../utils/commandRegistrar")
const {
    fetchOrCreateUser
} = require("./helpers/user")
const {
    startup
} = require('./utils/startup')

require('./commands')


const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
let db, started, ctx

bot.once('ready', async () => {
    db = getDBConnection()
    started = true
    let slashCommands = require('./static/commands.json')
    const globalCommands = await bot.application.getGlobalCommands()
    if (globalCommands.length !== slashCommands.general.length) {
        console.log('Updating global commands as a mis-match was found')
        await bot.application.bulkEditGlobalCommands(slashCommands.general)
    }
})

bot.on('ready', async () => {
    await bot.editStatus('online', [{ name: 'commands', type: 2}])
    console.log('Amusement Club is Online')
})

process.on('message', async (msg) => {
    if (msg.startup) {
        const baseContext = await startup()
        ctx = Object.assign({}, baseContext, {bot})
    }
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
    let user = await fetchOrCreateUser(interaction)
    await handleAmusementCommand([interaction.data.name], {ctx, interaction, user})
})