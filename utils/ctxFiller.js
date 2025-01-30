const {getCommandOptions} = require("./optionsHandler");
const {Collections, Cards} = require("../db");
const {getDBConnection} = require("./dbConnection");
const {getConfig} = require("./fileHelpers");

const byAlias = (ctx, name) => {
    const regex = new RegExp(name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    return ctx.collections.filter(x => x.aliases.some(y => regex.test(y)))
}

const bestColMatch = (ctx, name) => {
    const c = byAlias(ctx, name)
    return c.sort((a, b) => a.id.length - b.id.length)
}

const getContext = async () => {
    let ctx = {}
    ctx.config = getConfig()
    ctx.db = await getDBConnection(ctx)
    ctx.collections = await Collections.find()
    ctx.cards = await Cards.find()
    return ctx
}

const ctxFiller = async (ctx, bot) => {
    let args = await getCommandOptions(ctx, ctx.user)
    return Object.assign({}, ctx, {
        args,
        reply: (user, string, color = 'default', edit) => {},
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
    })
}

module.exports = {
    ctxFiller,
    getContext
}