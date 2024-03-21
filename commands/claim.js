const _ = require("lodash")

const {
    cmd,
} = require("../utils/cmd")

const {
    Claims,
} = require('../collections')

const {
    withCards,
    formatCard,
} = require("../modules/card")

const {
    addUserCards,
} = require("../modules/usercards")

const {
    formatDateTimeRelative,
} = require("../utils/tools")


cmd(['claim', 'cards'], async (ctx, user, args) => await claimCards(ctx, user, args))

cmd(['claim', 'history'], async (ctx, user, args) => await claimHistory(ctx, user, args))

cmd(['claim', 'info'], async (ctx, user, args) => await claimInfo(ctx, user, args))

// To-do re-write
const claimCards = withCards(async (ctx, user, args, cardstuff) => {
    const cards = []
    const now = new Date()

    const curBoost = ctx.boosts.filter(x => x.starts < now && x.expires > now)
    const activePromo = ctx.promos.find(x => x.starts < now && x.expires > now)

    if (args.promo && !activePromo) {
        return ctx.reply(user, `there is currently no event running because there is not even cards available!`, 'red')
    }

    const count = args.count? args.count : 1
    const price = 1

    if (!args.promo && price > user.tomatoes)
        return ctx.reply(user, `you don't have enough tomatoes to claim a card! You need ${price} more tomatoes!`, 'red')

    if (args.promo && price > user.promoBal)
        return ctx.reply(user, `you don't have enough promo balance to claim a card! You need ${price} more!`, 'red')

    let rngtext = ''
    let claimText = ''
    for (let i = 0; i < count; i++) {
        let rng = Math.random()
        rngtext += rng + `\n`

        const rares = _.sample(ctx.collections.filter(x => x.rarity > rng))
        const collection = activePromo && args.promo? activePromo: rares? rares: _.sample(ctx.collections.filter(x => !x.rarity && !x.promo))
        let card, boostDrop = false
        const colCards = ctx.cards.filter(x => x.col === collection.id)
        if (curBoost && rng < curBoost.rate) {
            boostDrop = true
            card = ctx.cards[_.sample(curBoost.cards)]
        } else {
            card = _.sample(colCards.filter(x => x.level < 5 && !x.excluded))
        }

        const userCard = cardstuff.find(x => x.cardID === card.id)
        const alreadyClaimed = cards.filter(x => x.card === card).length
        const count = userCard? (alreadyClaimed + 1) + userCard.amount: alreadyClaimed? alreadyClaimed + 1: 1

        cards.push({
            count,
            card
        })
    }

    const pages = cards.map(x => x.card.url)

    await addUserCards(user, cards.map(x => x.card.id))

    const newCards = cards.filter(x => x.count === 1)
    const oldCards = cards.filter(x => x.count > 1)
    if (newCards.length > 0)
        claimText += `### New Cards\n`
    newCards.map(x => claimText += `${formatCard(ctx, x.card)}\n`)
    if (oldCards.length > 0)
        claimText += `### Duplicates\n`
    oldCards.map(x => claimText += `${formatCard(ctx, x.card)} #${x.count}\n`)
    await ctx.sendInteraction(ctx, user, {
        pages,
        embed: {
            description: `**${user.username}**, you got:\n${claimText}\n${rngtext}`,
            image: { url: '' }
        },
        switchPage: (data) => data.embed.image.url = data.pages[data.pageNum],
        buttons: ['back', 'next']
    })
    // await ctx.interaction.createFollowup({content: `claim card command\n${rngtext}`})

}, {allowEmpty: true})

const claimHistory = withCards(async (ctx, user, args, cards) => {
    const query = {userID: user.userID}

    if (args.cardQuery) {
        query.cards = {$in: cards.map(x => x.id)}
    }

    const claimHistory = await Claims.find(query, {cards: 1, date: 1, claimID: 1}, {sort: { date: -1 }}).lean()

    const claims = []
    claimHistory.map(x => {
        x.cards.map(cardID => claims.push({ date: x.date, card: cardID, claimID: x.claimID}))
    })

    if (claims.length === 0)
        return ctx.reply(user, `no matching claims found!`, 'red')

    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(claims.map(x => `\`${x.claimID}\` ${formatDateTimeRelative(x.date)} ${formatCard(ctx, ctx.cards[x.card])}`), 15),
        embed: {
            author: { name: `Matched ${claims.length} card(s) from ${claimHistory.length} claim(s)`}
        }
    })
}, {global: true})

const claimInfo = async (ctx, user, args) => {
    const claim = await Claims.findOne({ userID: user.userID, claimID: args.claimID })

    if (!claim)
        return ctx.reply(user, `claim with the ID \`${args.claimID}\` was not found!`, 'red')

    const guild = ctx.bot.guilds.get(claim.guild)
    const response = [
        `Cards: **${claim.cards.length}**`,
        `Price: **${claim.cost}** ${ctx.symbols.tomato}`,
    ]

    if (guild)
        response.push(`Guild: **${guild.name}`)

    if (claim.lock)
        response.push(`With lock to: **${claim.lock}**`)

    response.push(formatDateTimeRelative(claim.date))

    return ctx.sendInteraction(ctx, user, {
        embed: {
            author: { name: `Claim [${claim.id}] by ${user.username}` },
            description: response.join('\n'),
            color: ctx.colors.blue,
            fields: [{
                name: "Cards",
                value: claim.cards.map(c => formatCard(ctx, ctx.cards[c])).join('\n')
            }]
        }
    })
}