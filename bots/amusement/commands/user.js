const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {
    getUserStats,
} = require("../helpers/stats")



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
    let nextUserDaily = new Date(ctx.user.lastDaily).getTime() + ctx.hourToMS(20)
    console.log(nextUserDaily)
    if (ctx.user.lastDaily < nextUserDaily) {
        return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you can claim your daily <t:${Math.floor(nextUserDaily / 1000)}:R>`, 'red')
    }
    ctx.user.tomatoes += 750
    ctx.user.lastDaily = new Date()
    await ctx.user.save()
    ctx.stats = await getUserStats(ctx)
    await ctx.updateStat(ctx, 'tomatoIn', 750)
    await ctx.send(ctx, `You have claimed daily! You now have ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes!`)
}

const balance = async (ctx) => {
    await ctx.send(ctx, `Your balance is currently\n- ${ctx.fmtNum(ctx.user.tomatoes)}${ctx.symbols.tomato}\n- ${ctx.fmtNum(ctx.user.lemons)}${ctx.symbols.lemon}\n- ${ctx.fmtNum(ctx.user.promoBal)}${ctx.symbols.promo}`)
}

const cards = async (ctx) => {
    const pages = ctx.getPages(ctx.userCards.map(x => ctx.formatName(ctx, x)), 15)
    return await ctx.send(ctx, {
        embed: {
          title: `${ctx.user.username}, your cards (${ctx.fmtNum(ctx.userCards.length)} results)`
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