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
    getUserCardsLean,
    mergeUserCards
} = require("../bots/amusement/helpers/userCard")

const {
    getUserStats
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

    if (ctx.cmdOptions?.withCards) {
        userCards = await getUserCardsLean(ctx, ctx.user)
        userCards  = await mergeUserCards(ctx, userCards)
        userCards.sort(args.cardQuery.sort)
    }

    let userStats = await getUserStats(ctx)
    return Object.assign({}, ctx, {
        args,
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
            return `[${rarity}]${card.locked? ' `🔒`': ''}${card.fav? ' `❤`' : ''} [${card.displayName}](${card.cardURL}) \`[${card.collectionID}]\`${card.amount && card.amount > 1? `(x${card.amount})`: ''}${` ${card.eval}`}`
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

        }
    })
}

module.exports = {
    globalContext,
    ctxFiller,
    getContext
}