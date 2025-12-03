const Emitter = require('events')

const {
    getCommandOptions
} = require("./optionsHandler")

const {
    getDBConnection
} = require("./dbConnection")

const {
    getConfig
} = require("./fileHelpers")

const {
    sendInteraction
} = require("./messageCreation")

const {
    withCards,
} = require("../bots/amusement/helpers/userCard")

const {
    getUserStats,
    updateUserStats,
} = require("../bots/amusement/helpers/stats")

const {
    Collections,
    Cards,
    Promos
} = require("../db")

let globalContext = {}


const getContext = async (bot) => {
    if (globalContext.events) {
        return globalContext
    }

    globalContext.config = getConfig()
    globalContext.db = await getDBConnection(globalContext)
    globalContext.collections = await Collections.find().lean()
    globalContext.cards = await Cards.find().lean().sort('cardID')
    globalContext.promos = await Promos.find().lean()
    globalContext.events = new Emitter()

    return globalContext
}

const ctxFiller = async (ctx, bot) => {
    let args = await getCommandOptions(ctx, ctx.user)

    let userCards

    if (ctx.cmdOptions?.withCards || ctx.options.card_query) {
        userCards = await withCards(ctx, args)

    }

    let userStats = await getUserStats(ctx)
    return Object.assign({}, ctx, {
        args,
        stats: userStats,
        userCards: userCards,
        send: sendInteraction,
        sendDM: async (ctx, user, message, color) => {
            try {
                let dmChannel = await ctx.bot.rest.users.createDM(user.userID)
                await dmChannel.createMessage({embeds: [ctx.toEmbed(user, message, color)]})
            } catch (e) {
                console.log(e)
            }
        },
        updateStat: async (ctx, stat, amount) => await updateUserStats(ctx, stat, amount),
        secToMS: (seconds) => seconds * 1000,
        minToMS: (minutes) => minutes * 60 * 1000,
        hourToMS: (hours) => hours * 60 * 60 * 1000,
        dayToMS: (days) => days * 24 * 60 * 60 * 1000,
        toEmbed: (user, string, color = 2067276) => {
            if (typeof string === 'object') {
                string.description = `**${user.username}**, ${string.description}`
                string.color = color
                return string
            }
            return { description: `**${user.username}**, ${string}`, color: color }
        },
        fmtNum: (num) => num.toLocaleString('en-US'),
        formatName: (ctx, card) => {
            const col = ctx.collections.find(x => x.collectionID === card.collectionID)
            const rarity = new Array(card.rarity + 1).join(col.stars[card.rarity - 1] || col.stars[0])
            const eval = ctx.fmtNum(card.eval)
            const amount = card.amount && card.amount > 1? `(x${card.amount})`: ''
            const locked = card.locked? ' `🔒`': ''
            const fav = card.fav? ' `❤`' : ''
            return `[${rarity}]${ctx.args.fmtOptions.locked? locked: ''}${ctx.args.fmtOptions.fav? fav: ''} [${card.displayName}](${card.cardURL}) \`[${card.collectionID}]\`${ctx.args.fmtOptions.amount? amount: ''}${ctx.args.fmtOptions.eval? ` ${eval}`: ''}`
        },
        getPages: (array, split = 10, maxCharacters = 4096) => {
            let count = 0, page = 0
            const pages = [""]
            array.map(x => {
                const entry = `${x}\n`

                if(count >= split || pages[page].length + entry.length > maxCharacters) {
                    page++
                    count = 1
                    pages[page] = entry
                } else {
                    count++
                    pages[page] += entry
                }
            })

            return pages
        },
        boldName: (name) => {
            return `**${name}**`
        },
        colors: {
            red: 14356753,
            yellow: 16756480,
            green: 1030733,
            blue: 1420012,
            grey: 3553598,
            deepgreen:1142316,
            default: 2067276
        },
        symbols: {
            tomato: '`🍅`',
            lemon: '`🍋`',
            auctionNoBid: '`🔹`',
            auctionHasBid: '`🔷`',
            auctionOwn: '`🔸`',
            auctionIcon: '`▫️`',
            accept: '`✅`',
            decline: '`❌`',
            promo: '`✨`'
        }
    })
}

module.exports = {
    globalContext,
    ctxFiller,
    getContext
}