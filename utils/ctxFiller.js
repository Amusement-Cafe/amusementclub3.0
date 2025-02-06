const {getCommandOptions} = require("./optionsHandler");
const {Collections, Cards} = require("../db");
const {getDBConnection} = require("./dbConnection");
const {getConfig} = require("./fileHelpers");
const {sendInteraction} = require("./messageCreation");
const Emitter = require('events')


let globalContext = {}


const getContext = async (bot) => {
    if (globalContext.events) {
        return globalContext
    }

    globalContext.config = getConfig()
    globalContext.db = await getDBConnection(globalContext)
    globalContext.collections = await Collections.find()
    globalContext.cards = await Cards.find()
    globalContext.events = new Emitter()

    return globalContext
}

const ctxFiller = async (ctx, bot) => {
    let args = await getCommandOptions(ctx, ctx.user)
    return Object.assign({}, ctx, {
        args,
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
            const rarity = new Array(card.rarity + 1).join(col.stars[card.rarity] || col.stars[0])
            return `[${rarity}]${card.locked? ' `🔒`': ''}${card.fav? ' `❤`' : ''} [${card.displayName}](${card.cardURL}) \`[${card.collectionID}]\``
        },
        colors: {
            red: 14356753,
            yellow: 16756480,
            green: 1030733,
            blue: 1420012,
            grey: 3553598,
            deepgreen:1142316,
            default: 2067276
        }
    })
}

module.exports = {
    globalContext,
    ctxFiller,
    getContext
}