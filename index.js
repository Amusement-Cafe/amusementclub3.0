const Oceanic   = require('oceanic.js')
const _         = require("lodash")
const Filter    = require("bad-words")
const mongoose  = require("mongoose")

const {
    trigger,
    con,
    cmd,
} = require('./utils/cmd')

const {
    commandInteractionHandler,
    componentInteractionHandler,
    modalInteractionHandler,
} = require("./modules/commandhandler")

const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
const shards = new Oceanic.ShardManager(bot, {maxShards: parseInt(process.env.shards) })
let ctx, config, mcn, started

const filter = new Filter()

process.on('message', async (message) => {
    const cmd = _.keys(message)
    await trigger('con', message, null, cmd)
})

con('startup', async (data) => {
    config = data.startup
    mcn = await mongoose.connect(config.bot.database)
    filter.addWords(...config.data.bannedwords)

    /* create our context */
    ctx = {
        bot, /* created and connected Eris bot instance */
        cards: config.data.cards, /* data with cards */
        collections: config.data.collections, /* data with collections */
        adminGuildID: config.bot.adminGuildID,
        promos: config.data.promos.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})),
        boosts: config.data.boosts.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})),
        autoAuction: config.auction.auto,
        auctionFeePercent: config.auction.auctionFeePercent,
        filter,
        symbols: config.symbols,
        baseurl: config.links.baseurl,
        links: config.links,
        invite: config.bot.invite,
        prefix: config.bot.prefix,
        uniqueFrequency: config.effects.uniqueFrequency,
        eval: config.evals,
        cafe: 'https://discord.gg/xQAxThF', /* support server invite */
        config,
        rng: config.rng,
        guildLogChannel: config.channels.guildLog,
        reportChannel: config.channels.report,
        settings: {
            wip: config.bot.maintenance,
            wipMsg: 'bot is currently under maintenance. Please check again later |ω･)ﾉ',
            aucLock: config.auction.lock
        }
    }
    await bot.connect()
})

con('shutdown', async () => {
    await bot.disconnect(false)
    process.exit()
})

bot.once('ready', () => {
    console.log('online')
    started = true
})

bot.on('interactionCreate', async (interaction) => {
    if (!started)
        return

    switch (interaction.constructor) {
        case Oceanic.CommandInteraction:
            return await commandInteractionHandler(ctx, interaction)
        case Oceanic.ComponentInteraction:
            return await componentInteractionHandler(ctx, interaction)
        case Oceanic.ModalSubmitInteraction:
            return await modalInteractionHandler(ctx, interaction)
        default:
            return interaction.channel.createMessage({content: `You have somehow submitted an interaction we can't handle!`})
    }

})

bot.on('error', async (err, sh) => {
    process.send({error: {message: err.message, stack: err.stack}})
})

cmd('balance', async (ctx, user, args) => await testFunction(ctx, user, args), {ephemeral: true})
cmd('daily', async (ctx, user, args) => await testFunction(ctx, user, args))




const testFunction = async (one, two, three) => {
    await one.interaction.createFollowup({content: 'You did a command!'})
    // console.log(one)
    // console.log(two)
    // console.log(three)
}