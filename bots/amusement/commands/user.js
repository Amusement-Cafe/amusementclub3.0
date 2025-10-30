const {registerBotCommand} = require('../../../utils/commandRegistrar')
const _ = require('lodash')
const {has} = require("lodash");

registerBotCommand('daily', async (ctx) => await daily(ctx))

registerBotCommand('balance', async (ctx) => await balance(ctx))

registerBotCommand('profile', async (ctx) => await showProfile(ctx))

registerBotCommand('has', async (ctx) => await userHas(ctx))

registerBotCommand('miss', async (ctx) => await userMissing(ctx))

registerBotCommand('achievements', async (ctx) => await userAchievements(ctx))

registerBotCommand('quests', async (ctx) => await listQuests())

registerBotCommand(['diff', 'for'], async (ctx) => await userDiff(ctx))

registerBotCommand(['diff', 'from'], async (ctx) => await userDiff(ctx, true))

registerBotCommand(['cards'], async (ctx) => await cards(ctx), {withCards: true})

registerBotCommand(['cards', 'global'], async (ctx) => await cards(ctx), { global: true })


const daily = async (ctx) => {
    ctx.user.tomatoes += 1
    await ctx.send(ctx, `You have claimed daily! You now have ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes!`)
    await ctx.user.save()
}

const balance = async (ctx) => {
    await ctx.send(ctx, `Your balance is currently ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes.\n~~I'll re-add symbols soon-ish~~`)
}

const cards = async (ctx) => {
    const pages = ctx.getPages(ctx.userCards.map(x => ctx.formatName(ctx, x)), 15)
    return await ctx.send(ctx, {
        embed: {
          title: `Your cards, temp`
        },
        pages,
    })
}

const showProfile = async (ctx) => {}

const userHas = async (ctx) => {}

const userMissing = async (ctx) => {}

const userAchievements = async (ctx) => {}

const listQuests = async (ctx) => {}

const userDiff = async (ctx, from = false) => {}