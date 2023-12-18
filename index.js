const Oceanic   = require('oceanic.js')
const _         = require("lodash")
const Filter    = require("bad-words")
const mongoose  = require("mongoose")
const commands  = require('./commands')

const {
    trigger,
    con,
} = require('./utils/cmd')

const {
    commandInteractionHandler,
    componentInteractionHandler,
    modalInteractionHandler,
} = require("./modules/commandhandler")

const {
    fetchOrCreateUser
} = require('./modules/user')

const {
    startup,
    fillCardData
} = require('./utils/startup')

const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
const shards = new Oceanic.ShardManager(bot, {maxShards: parseInt(process.env.shards) })
let ctx, config, started


process.on('message', async (message) => {
    const cmd = _.keys(message)
    await trigger('con', message, null, cmd)
})

con('startup', async (data) => {
    config = data.startup
    await mongoose.connect(config.bot.database)

    const context = await startup(config)

    ctx = Object.assign({}, context, { bot })

    await bot.connect()
})

con('shutdown', async () => {
    await bot.disconnect(false)
    process.exit()
})

con('autorestart', async () => {
    ctx.settings.wip = true
    ctx.settings.wipMsg = `the bot is about to undergo a weekly restart. Please try your command again in a few minutes |ω･)ﾉ`
    await new Promise(res=>setTimeout(res,150000))
    // stopTicks()
    await bot.disconnect(false)
    process.exit()
})

con('updateCards', async (carddata) => {
    config.cards = fillCardData(carddata.updateCards)
    // await updateCompletion(ctx, config.cards, ctx.cards)
    ctx.cards = config.cards
})

con('updateCols', (coldata) => ctx.collections = coldata.updateCols)
con('updatePromos', (promodata) => ctx.promos = promodata.updatePromos.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})))
con('updateBoosts', (boostdata) => ctx.boosts = boostdata.updateBoosts.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})))
con('updateWords', (wordsdata) => filter.addWords(...wordsdata.updateWords))


bot.once('ready', () => {
    console.log('online')
    started = true
})

bot.on('interactionCreate', async (interaction) => {
    if (!started)
        return

    const interactionUser = interaction.user || interaction.member.user
    if (interactionUser.bot)
        return

    const user = await fetchOrCreateUser(ctx, interactionUser)

    switch (interaction.constructor) {
        case Oceanic.CommandInteraction:
            return await commandInteractionHandler(ctx, interaction, user)
        case Oceanic.ComponentInteraction:
            return await componentInteractionHandler(ctx, interaction, user)
        case Oceanic.ModalSubmitInteraction:
            return await modalInteractionHandler(ctx, interaction, user)
        default:
            return interaction.channel.createMessage({content: `You have somehow submitted an interaction we can't handle!`})
    }

})

bot.on('guildCreate', async (guild) => {
    if (ctx.guildLogChannel)
        await bot.rest.channels.createMessage(ctx.guildLogChannel, {embeds: [{
                description:`Invited to a new guild!\nGuild Name: **${guild.name}**\nGuild ID: \`${guild.id}\``,
                color: ctx.colors.green,
                thumbnail: {url: guild.iconURL}
            }]})
})

bot.on('guildDelete', async (guild) => {
    if (ctx.guildLogChannel)
        await bot.rest.channels.createMessage(ctx.guildLogChannel, {embeds: [{
                description:`Kicked from guild!\nGuild Name: **${guild.name? guild.name: 'Uncached Guild'}**\nGuild ID: \`${guild.id}\``,
                color: ctx.colors.red
            }]})
})

bot.on('error', async (err, sh) => {
    process.send({error: {message: err.message, stack: err.stack}})
})

process.on('unhandledRejection', (rej) => {
    process.send({unhandled: rej})
})
process.on('uncaughtException', (exc) => {
    process.send({uncaught: exc})
})

module.exports.schemas = require('./collections')
module.exports.modules = require('./modules')