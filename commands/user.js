const _ = require('lodash')
const nodeHtmlToImage = require('node-html-to-image')
const htmlProfile = require('../staticdata/profile')

const {
    cmd,
    rct,
} = require('../utils/cmd')

const {
    addTime,
    claimCostCalculator,
    formatDateTimeRelative,
    subTime,
} = require('../utils/tools')

const {
    Button
} = require('../staticdata/components')

const {
    getStats,
} = require("../modules/userstats")

const {
    checkEffect
} = require('../modules/effect')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    fetchUser
} = require("../modules/user")

const {
    getAllUserCards
} = require("../modules/usercards")


cmd('daily', async (ctx, user) => await daily(ctx, user))

cmd('balance', async (ctx, user, args) => await balance(ctx, user, args))

cmd('profile', async (ctx, user, args) => await profile(ctx, user, args))

cmd('has', async (ctx, user, args) => await has(ctx, user, args))

cmd('miss', async (ctx, user, args) => await miss(ctx, user, args))

cmd('stats', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('achievements', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('vote', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('todo', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'use'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'from'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'for'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

rct('red', async (ctx, user, args) => await buttonFunction(ctx, user, args))
rct('green', async (ctx, user, args) => await buttonFunction(ctx, user, args))
rct('stringy', async (ctx, user, args) => await selectFunction(ctx, user, args))

//ToDo Building Checks, Guild XP
const daily = async (ctx, user) => {
    const hasJeanne = await checkEffect()
    const availableDaily = addTime(user.lastDaily, hasJeanne? ctx.config.daily.interval * .8: ctx.config.daily.interval, 'hours')
    const now = new Date()

    if (availableDaily > now) {
        return ctx.reply(user, `your daily is not ready yet! You can claim your daily ${formatDateTimeRelative(availableDaily)}`, 'red')
    }

    const oldStats = await getStats(user, user.lastDaily, true)
    const dailyStreak = oldStats.daily >= subTime(now, 2, 'days')
    const baseAmount = ctx.config.daily.amount

    let amount = baseAmount, streakAddition

    if (dailyStreak) {
        user.streaks.daily.count++
        let maxStreak = user.premium.tier? (user.premium.tier * 25) + 100: 100
        streakAddition = user.streaks.daily.count >= maxStreak? maxStreak * 5: user.streaks.daily.count * 5
        amount += streakAddition
    } else {
        user.streaks.daily.lastCount = user.streaks.daily.count
        user.streaks.daily.count = 0
        // user.streaks.daily.lastReset = new Date()
    }

    if (await checkEffect())
        amount += 100 * (oldStats.claims || 0)

    let newStats = await getStats(user, null)
    newStats.daily = now
    newStats.tomatoesIn = amount

    ctx.botGuild.tomatoes += 1
    await ctx.botGuild.save()

    user.lastDaily = now
    user.tomatoes += amount
    user.xp += 10
    user.dailyNotified = false
    await user.save()
    await ctx.saveStatsAndCheck(ctx, user, newStats)

    let description = `you have received **${ctx.numFmt(amount)}**${ctx.symbols.tomatoes}`

    if (dailyStreak)
        description += `\nYou are currently on a **${ctx.numFmt(user.streaks.daily.count)}** day daily streak! You have gained an additional **${ctx.numFmt(streakAddition)}**${ctx.symbols.tomatoes}`

    description += `\nYou now have **${ctx.numFmt(user.tomatoes)}**${ctx.symbols.tomatoes}`

    await ctx.reply(user, {description}, 'green')
}

//ToDo Promo
const balance = async (ctx, user) => {
    // const now = new Date()
    const stats = await getStats(user, user.lastDaily, true)
    let max = 1
    while (claimCostCalculator(50, max, stats.claims) < user.tomatoes)
        max++

    const embed = {
        description: `you currently have **${ctx.numFmt(user.tomatoes)}**${ctx.symbols.tomatoes}, **${ctx.numFmt(user.vials)}**${ctx.symbols.vials}, and **${ctx.numFmt(user.lemons)}**${ctx.symbols.lemons}
        Your next claim will cost you **${ctx.numFmt(claimCostCalculator(50, 1, stats.claims))}**${ctx.symbols.tomatoes}
        ${ctx.botGuild && ctx.botGuild.tax > 0? `Your next claim in the **current guild** will cost ${ctx.numFmt(claimCostCalculator(50, 1, stats.claims, ctx.botGuild.tax))}`: ''}
        You can claim **${max - 1}** cards with your balance!`,
        color: ctx.colors.green,
    }


    return ctx.reply(user, embed)
}

const profile = async (ctx, user, args) => {
    await ctx.reply(user, `your profile image is currently being generated. Please wait a moment until it completes`, 'yellow')
    const thing = await nodeHtmlToImage({
        html: htmlProfile,
        puppeteerArgs: {
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-sandbox"
            ]
        },
        transparent: true,
        content: {
            avatar: ctx.interaction.user.avatarURL('png', 128),
            username: user.username
        }
    })
    return ctx.send(ctx, user, {embed: {image: {url: `attachment://profile.png`}, color: ctx.colors.blue}, files: [ {name: 'profile.png', contents: thing}], edit: true})
}

const has = withCards(async (ctx, user, args, cards) => {
    if (args.userIDs[0] === user.userID)
        return ctx.reply(user, `you can use \`/cards\` to see your own cards`, 'red')

    const otherUser = await fetchUser(args.userIDs[0])
    if (!otherUser)
        return ctx.reply(user, `a bot user with discord ID \`${args.userIDs[0]}\` was not found`, 'red')

    if (!otherUser.preferences.interact.canHas)
        return ctx.reply(user, `the user you are attempting to check has disabled the ability to check their cards with \`/has\``, 'red')

    const otherUserCards = await getAllUserCards(otherUser, true)
    const otherCardsFiltered = otherUserCards.map(x => Object.assign({}, ctx.cards[x.cardID], x)).filter(x => !x.locked && cards.some(y => y.id === x.cardID))

    if (otherCardsFiltered.length === 0)
        return ctx.reply(user, `**${otherUser.username}** does not have that card!`, 'red')

    if (otherCardsFiltered.length > 1)
        return ctx.reply(user, `please specify your card query so it only matches a single card!`, 'red')

    return ctx.reply(user, `Matched card ${formatCard(ctx, otherCardsFiltered[0])} ${otherCardsFiltered[0].fav? 'and it is marked as **favorite**': ''}`)
}, {global: true})

const miss = withCards(async (ctx, user, args, cards) => {
    const userCards = await getAllUserCards(user, true)
    const userCardIDs = userCards.map(x => x.cardID)
    const diffList = cards.filter(x => userCardIDs.indexOf(x.id) === -1).filter(x => !x.excluded).sort(args.cardQuery.sort)

    if (diffList.length === 0)
        return ctx.reply(user, `you have all the cards matching this request!`)

    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(diffList.map(x => formatCard(ctx, x)), 20),
        embed: { author: { name: `${user.username}, cards that you don't have (${ctx.numFmt(diffList.length)} results)` } }
    })
}, {global: true})

const stats = async (ctx, user, args) => {}

const defaultFunction = async (ctx, user, args) => {
    const btn = new Button('red_test_id').setLabel('Test Label').setStyle(4)
    const btn2 = new Button('green_anotherid').setLabel('Lol Label').setStyle(3)
    const select = {type:3, customID: 'stringy', options: [{description: 'option description', label: 'label 1', value: 'value1'}, {description: 'option description', label: 'label 2', value: 'value2'}]}
    await ctx.send(ctx, user, {selection: [select], buttons: [btn, btn2], permissions: {interact: [ctx.interaction.user.id], select: [ctx.interaction.user.id]}, content: 'Buttons!'})
}

const buttonFunction = async (ctx, user, args) => {
    await ctx.interaction.defer()
    console.log(ctx.selection)
    if (ctx.selection) {
        return await ctx.interaction.createFollowup({content: `You have selected the ${ctx.id.pop() === 'anotherid'? 'green': 'red'} button and your select option is ${ctx.selection.selection}`})
    }
    await ctx.interaction.editOriginal({content: `${ctx.id.pop()} BUTTON`, components:[]})
}

const selectFunction = async (ctx, user, args) => {
    await ctx.interaction.defer()
    await ctx.interaction.createFollowup({content: `You selected option ${ctx.id.pop()}`})
}