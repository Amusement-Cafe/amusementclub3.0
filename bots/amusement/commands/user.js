const {registerBotCommand} = require('../../../utils/commandRegistrar')

const {
    getUserStats,
} = require("../helpers/stats")

const {
    calculateClaimCost
} = require('../helpers/claim')

registerBotCommand('daily', async (ctx) => await daily(ctx))

registerBotCommand('balance', async (ctx) => await balance(ctx))

registerBotCommand('profile', async (ctx) => await showProfile(ctx))

registerBotCommand('has', async (ctx) => await userHas(ctx))

registerBotCommand('miss', async (ctx) => await userMissing(ctx), {withCards: true, globalCards: true})

registerBotCommand('achievements', async (ctx) => await userAchievements(ctx))

registerBotCommand('quests', async (ctx) => await listQuests())

registerBotCommand(['diff', 'for'], async (ctx) => await userDiff(ctx))

registerBotCommand(['diff', 'from'], async (ctx) => await userDiff(ctx, true))

registerBotCommand(['cards'], async (ctx) => await cards(ctx), {withCards: true})

registerBotCommand(['cards', 'global'], async (ctx) => await cards(ctx, true), { globalCards: true })


const daily = async (ctx) => {
    let nextDailyMS = ctx.user.lastDaily.getTime() + ctx.hourToMS(20)
    if (new Date() < new Date(nextDailyMS)) {
        return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you can claim your daily <t:${Math.floor(nextDailyMS / 1000)}:R>`, 'red')
    }
    ctx.user.tomatoes += 750
    ctx.user.lastDaily = new Date()
    await ctx.user.save()
    ctx.stats = await getUserStats(ctx)
    await ctx.updateStat(ctx, 'tomatoIn', 750)
    await ctx.send(ctx, `You have claimed daily! You now have ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes!`)
}

const balance = async (ctx) => {
    let activePromo = ctx.promos.some(x=> x.starts < new Date() && x.expires > new Date() && !x.isBoost && !x.isDiscount && !x.isBonus)
    let text = `Your balance is currently\n`
    text += `- ${ctx.boldName(ctx.fmtNum(ctx.user.tomatoes))}${ctx.symbols.tomato}\n`
    text += `- ${ctx.boldName(ctx.fmtNum(ctx.user.lemons))}${ctx.symbols.lemon}\n`
    if (activePromo) {
        text += `- ${ctx.boldName(ctx.fmtNum(ctx.user.promoBal))}${ctx.symbols.promo}\n`
    }
    text += `Your next claim will cost ${ctx.boldName(ctx.fmtNum(calculateClaimCost(ctx, 1, ctx.stats.claims)))}${ctx.symbols.tomato}\n`
    let max = 1
    while (calculateClaimCost(ctx, max, ctx.stats.claims) < ctx.user.tomatoes) {
        max++
    }
    text += `You can claim ${ctx.boldName(ctx.fmtNum(max - 1))} more cards with your balance`
    if (activePromo) {
        text += `\n\n`
        text += `Your next promo claim will cost ${ctx.boldName(ctx.fmtNum(calculateClaimCost(ctx, 1, ctx.stats.promoClaims, true)))}${ctx.symbols.promo}\n`
        max = 1
        while (calculateClaimCost(ctx, max, ctx.stats.promoClaims) < ctx.user.promoBal) {
            max++
        }
        text += `You can claim ${ctx.boldName(ctx.fmtNum(max-1))} more promo cards with your balance`
    }
    await ctx.send(ctx, text)
}

const cards = async (ctx, global = false) => {
    let cardsChecked = global? ctx.globalCards: ctx.userCards
    let errorResponse = global? `There are no cards in the bot that match your query! Please try your command again`: `You have no cards matching your card query! Please try your command again.`
    if (cardsChecked.length === 0) {
        return ctx.send(ctx, errorResponse, 'red')
    }
    const pages = ctx.getPages(cardsChecked.map(x => ctx.formatName(ctx, x)), 15)

    let title = global? `Matched cards from database (${ctx.fmtNum(cardsChecked.length)} results)`: `${ctx.user.username}, your cards (${ctx.fmtNum(cardsChecked.length)} results)`
    return await ctx.send(ctx, {
        embed: {
          title: title
        },
        pages,
    })
}

const showProfile = async (ctx) => {}

const userHas = async (ctx) => {}

const userMissing = async (ctx) => {
    const cardIDs = ctx.userCards.map(x => x.cardID)
    const missing = ctx.globalCards.filter(x => !cardIDs.includes(x.cardID)).filter(x => x.canDrop).sort(ctx.args.cardQuery.sort)
    const pages = ctx.getPages(missing.map(x => ctx.formatName(ctx, x)), 15)
    return ctx.send(ctx, {
        pages,
        embed: {
            description: 'miss'
        }
    })
}

const userAchievements = async (ctx) => {}

const listQuests = async (ctx) => {}

const userDiff = async (ctx, from = false) => {}