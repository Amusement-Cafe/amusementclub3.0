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
    withGlobalCards
} = require("../bots/amusement/helpers/cards")

const {
    Collections,
    Cards,
    Promos
} = require("../db")

const {
    items
} = require('../bots/amusement/static/items')



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

    let userCards, globalCards

    if (ctx.cmdOptions?.withCards || ctx.options.card_query) {
        userCards = await withCards(ctx, args)
    }

    if (ctx.cmdOptions?.globalCards || ctx.options.card_query) {
        globalCards = await withGlobalCards(ctx, args)
    }

    let userStats = await getUserStats(ctx)
    return Object.assign({}, ctx, {
        args,
        items,
        stats: userStats,
        userCards: userCards,
        globalCards: globalCards,
        send: sendInteraction,
        sendDM: async (ctx, user, message, color) => {
            try {
                let dmChannel = await ctx.bot.rest.users.createDM(user.userID)
                await dmChannel.createMessage({embeds: [ctx.toEmbed(user, message, color)]})
            } catch (e) {
                console.log(e)
            }
        },
        sleep: async (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        updateStat: async (ctx, stat, amount) => await updateUserStats(ctx, stat, amount),
        secToMS: (seconds) => seconds * 1000,
        minToMS: (minutes) => minutes * 60 * 1000,
        hourToMS: (hours) => hours * 60 * 60 * 1000,
        dayToMS: (days) => days * 24 * 60 * 60 * 1000,
        timeDiff: (ms) => {
            let seconds = Math.floor(ms / 1000)

            const years = Math.floor(seconds / 31536000)
            seconds %= 31536000

            const months = Math.floor(seconds / 2592000)
            seconds %= 2592000

            const weeks = Math.floor(seconds / 604800)
            seconds %= 604800

            const days = Math.floor(seconds / 86400)
            seconds %= 86400

            const hours = Math.floor(seconds / 3600)
            seconds %= 3600

            const minutes = Math.floor(seconds / 60)
            seconds %= 60

            return { years, months, weeks, days, hours, minutes, seconds }
        },
        timeDisplay: (ctx, time) => {
            const roundHalf = (num) => Math.round(num * 2) / 2
            const diff = ctx.timeDiff(Date.now() - time)

            if (diff.years) {
                return `${roundHalf(diff.years + (diff.months * 30 + diff.weeks * 7 + diff.days) / 365)}y`
            }

            if (diff.months) {
                return `${roundHalf(diff.months + (diff.weeks * 7 + diff.days) / 30)}mo`
            }

            if (diff.weeks) {
                return `${diff.weeks}w`
            }

            if (diff.days) {
                return `${diff.days}d`
            }

            if (diff.hours) {
                return `${roundHalf(diff.hours + diff.minutes / 60 + diff.seconds / 3600)}h`
            }

            if (diff.minutes) {
                return `${diff.minutes}m`
            }

            return `${diff.seconds}s`
        },
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
            return `[${rarity}]${ctx.args.fmtOptions.locked? locked: ''}${ctx.args.fmtOptions.fav? fav: ''} [${card.displayName}](${card.cardURL}) \`[${card.collectionID}]\`${ctx.args.fmtOptions.amount? amount: ''}${ctx.args.fmtOptions.eval? ` ${eval}${ctx.symbols.tomato}`: ''}`
        },
        deDuplicate: (array, deDupeBy) => array.reduce((acc, current) => {
            const exists = acc.find(item => item[deDupeBy] === current[deDupeBy])
            if (!exists) {
                return acc.concat([current])
            } else {
                return acc
            }
        }, []),
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
            auctionTrans: '`🔨`',
            accept: '`✅`',
            pending: '`❗`',
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