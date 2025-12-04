const _ = require("lodash")

const {
    registerBotCommand
} = require('../../../utils/commandRegistrar')

const {
    addUserCards
} = require("../helpers/userCard")

const {
    calculateClaimCost
} = require("../helpers/claim")

let processing = []

registerBotCommand(['claim'], async (ctx) => await claimNormal(ctx), {withCards: true})

const claimNormal = async (ctx) => {
    if (ctx.args.promo) {
        return await claimPromo(ctx)
    }

    const claims = ctx.args.count || 1
    const price = calculateClaimCost(ctx, claims, ctx.stats.claims)
    if (price > ctx.user.tomatoes) {
        return ctx.send(ctx, `**${ctx.user.username}**, you have an insufficient tomato balance to claim ${claims} cards!`, 'red')
    }
    await ctx.send(ctx, `Claiming cards, please wait...`, 'yellow')
    if (processing.some(x => x === ctx.user.userID)) {
        return ctx.send(ctx, `${ctx.user.username}, this claim has been cancelled as you already have one processing.`, 'yellow')
    }
    processing.push(ctx.user.userID)


    let claimed = []
    ctx.collections = ctx.collections.filter(x => x.inClaimPool && (!x.rarity || x.rarity > 0))
    let legClaim = false
    for (let i = 0; i < claims; i++) {
        let claimRNG = Math.random()
        let legRNG = Math.random() < ctx.config.amusement.legendaryDrop
        const spec = _.sample(ctx.collections.filter(x => x.rarity > claimRNG))
        const col = spec || _.sample(ctx.collections.filter(x => !x.rarity))
        let cards = ctx.cards.filter(x => col.collectionID === x.collectionID && (legRNG? true: x.rarity < 5))
        let card = _.sample(cards)
        let owned = ctx.userCards.find(x => x.cardID === card.cardID)
        let alreadyClaimed = claimed.filter(x => x.cardID === card.cardID).length
        card.count = owned? (alreadyClaimed + 1 ) + owned.amount: alreadyClaimed? alreadyClaimed + 1: 1
        if (card.rarity === 5) {
            legClaim = true
        }
        claimed.push(card)
    }
    if (claimed.length === 0) {
        return ctx.send(ctx, {
            embed: {
                description: `There was an error claiming your cards, your balance and stats were not modified. Please try again!`,
                color: ctx.colors.red
            },
            edit: true
        })
    }
    if (legClaim) {
        await ctx.send(ctx, {
            embed: {
                description: 'Claiming cards, please wait...???',
                color: ctx.colors.blue
            },
            edit: true
        })
        await ctx.sleep(2000)
    }

    claimed.sort((a, b) => b.rarity - a.rarity)

    const newCards = claimed.filter(x => x.count === 1)
    const ownedCards = claimed.filter(x => x.count > 1)

    await addUserCards(ctx.user.userID, claimed.map(x => x.cardID))
    await ctx.updateStat(ctx, 'totalRegularClaims', claims)
    await ctx.updateStat(ctx, 'claims', claims)
    ctx.user.tomatoes -= price
    await ctx.user.save()

    let fields = []
    let desc = `${ctx.boldName(ctx.user.username)}, you claimed:\n`
    fields.push({name: `New Cards`, value: newCards.map(x => `${ctx.formatName(ctx, x)}`).join('\n')})
    fields.push({name: 'Duplicates', value: ownedCards.map(x => `${ctx.formatName(ctx, x)} #${x.count}`).join('\n')})
    fields = fields.filter(x => x && x.value)

    fields = fields.map(x => {
        desc += x.name + '\n' + x.value + '\n'
    }).filter(x => !x && x)
    let max = 1
    while(calculateClaimCost(ctx, max, ctx.stats.claims) < ctx.user.tomatoes) {
        max++
    }
    fields.push({
        name: `Receipt`,
        value: `You spent **${ctx.fmtNum(price)}**${ctx.symbols.tomato} in total
        You have ${ctx.boldName(ctx.fmtNum(ctx.user.tomatoes))}${ctx.symbols.tomato} remaining
        You can claim ${ctx.boldName(max - 1)} more cards today
        Your next claim will cost ${ctx.boldName(ctx.fmtNum(calculateClaimCost(ctx, 1, ctx.stats.claims)))}${ctx.symbols.tomato}`.replace(/\s\s+/gm, '\n')
    })

    _.pull(processing, ctx.user.userID)

    return ctx.send(ctx, {
        embed: {
            image: {
                url: claimed[0].cardURL
            },
            description: desc,
            fields,
        },
        switchPage: (data) => data.embed.image.url = data.pages[data.pageNum],
        pages: claimed.map(x => x.cardURL),
        edit: true
    })
}

const claimPromo = async (ctx) => {
    return ctx.send(ctx, 'no', 'red')
}