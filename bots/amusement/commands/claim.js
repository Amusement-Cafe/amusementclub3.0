const _ = require("lodash")

const Claims = require("../../../db/claim")

const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    generateNewID
} = require("../../../utils/misc")

const {
    addUserCards
} = require("../helpers/userCard")

const {
    calculateClaimCost
} = require("../helpers/claim")

let processing = []

registerBotCommand(['claim'], async (ctx) => await claimNormal(ctx), {withCards: true})

registerReaction(['claim', 'show'], async (ctx) => {})

const claimNormal = async (ctx) => {
    if (ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `You can only claim cards within guilds!`, 'red')
    }

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
    let collectionPool = [...ctx.collections.filter(x => x.inClaimPool && (!x.rarity || x.rarity > 0))]
    let lockCol, legClaim = false
    if (ctx.guild.lockCol && !ctx.args.any) {
        lockCol = ctx.collections.filter(x => x.collectionID === ctx.guild.lockCol)
        lockCol = lockCol.length > 0? lockCol[0]: false
    }
    for (let i = 0; i < claims; i++) {
        let claimRNG = Math.random()
        let legRNG = Math.random() < ctx.config.amusement.legendaryDrop
        const spec = _.sample(collectionPool.filter(x => x.rarity > claimRNG))
        const col = spec || lockCol || _.sample(collectionPool.filter(x => !x.rarity))
        let cards, card
        if (legRNG) {
            cards = ctx.cards.filter(x => x.canDrop && x.rarity === 5).filter(x => collectionPool.some(y => x.collectionID === y.collectionID))
            card = _.sample(cards)
        } else {
            cards = ctx.cards.filter(x => col.collectionID === x.collectionID)
            card = _.sample(cards)
        }
        let owned = ctx.userCards.find(x => x.cardID === card.cardID)
        let alreadyClaimed = claimed.filter(x => x.card.cardID === card.cardID).length
        let count = owned? (alreadyClaimed + 1 ) + owned.amount: alreadyClaimed? alreadyClaimed + 1: 1
        if (card.rarity === 5) {
            legClaim = true
        }
        claimed.push({
            card,
            count
        })
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
    claimed.sort((a, b) => b.card.rarity - a.card.rarity)

    const newCards = claimed.filter(x => x.count === 1)
    const ownedCards = claimed.filter(x => x.count > 1)
    const cardIDs = claimed.map(x => x.card.cardID)

    await addUserCards(ctx.user.userID, cardIDs)
    await ctx.updateStat(ctx, 'totalRegularClaims', claims)
    await ctx.updateStat(ctx, 'claims', claims)
    ctx.user.tomatoes -= price
    await ctx.user.save()
    await ctx.updateStat(ctx, 'tomatoOut', price)

    let fields = []
    let desc = `${ctx.boldName(ctx.user.username)}, you claimed:\n`
    fields.push({name: `**New Cards**`, value: newCards.map(x => `${ctx.formatName(ctx, x.card)}`).join('\n')})
    fields.push({name: '**Duplicates**', value: ownedCards.map(x => `${ctx.formatName(ctx, x.card)} #${x.count}`).join('\n')})
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

    const claim = new Claims()
    claim.claimID = generateNewID()
    claim.cardIDs = cardIDs
    claim.userID = ctx.user.userID
    claim.cost = price
    await claim.save()
    _.pull(processing, ctx.user.userID)

    let pages = claimed.map(x => x.card.cardURL)
    return ctx.send(ctx, {
        embed: {
            image: {
                url: claimed[0].card.cardURL
            },
            description: desc,
            fields,
        },
        switchPage: (data) => data.embed.image.url = data.pages[data.pageNum],
        pages,
        edit: true,
    })
}

const claimPromo = async (ctx) => {
    const now = new Date()
    let activePromo = [...ctx.promos].filter(x => !x.isBoost && !x.isBonus && !x.isDiscount && new Date(x.starts) <= now && now <= new Date(x.expires))
    if (!activePromo.length) {
        return ctx.send(ctx, `There are currently no ongoing promotions to claim for!`, 'red')
    }
    activePromo = activePromo[0]

    const claims = ctx.args.count || 1
    const price = calculateClaimCost(ctx, claims, ctx.stats.promoClaims, true)
    if (price > ctx.user.promoBal) {
        return ctx.send(ctx, `**${ctx.user.username}**, you have an insufficient promo balance to claim ${claims} cards!`, 'red')
    }
    await ctx.send(ctx, `Claiming cards, please wait...`, 'yellow')
    if (processing.some(x => x === ctx.user.userID)) {
        return ctx.send(ctx, `${ctx.user.username}, this claim has been cancelled as you already have one processing.`, 'yellow')
    }
    processing.push(ctx.user.userID)

    let claimed = []
    let collectionPool = [...ctx.collections.filter(x => x.collectionID === activePromo.promoID)]
    for (let i = 0; i < claims; i++) {
        const col = collectionPool[0]
        let cards, card
        cards = ctx.cards.filter(x => col.collectionID === x.collectionID)
        card = _.sample(cards)
        let owned = ctx.userCards.find(x => x.cardID === card.cardID)
        let alreadyClaimed = claimed.filter(x => x.card.cardID === card.cardID).length
        let count = owned? (alreadyClaimed + 1 ) + owned.amount: alreadyClaimed? alreadyClaimed + 1: 1
        claimed.push({
            card,
            count
        })
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

    claimed.sort((a, b) => b.card.rarity - a.card.rarity)

    const newCards = claimed.filter(x => x.count === 1)
    const ownedCards = claimed.filter(x => x.count > 1)
    const cardIDs = claimed.map(x => x.card.cardID)

    await addUserCards(ctx.user.userID, cardIDs)
    await ctx.updateStat(ctx, 'promoClaims', claims)
    ctx.user.promoBal -= price
    await ctx.user.save()
    await ctx.updateStat(ctx, 'promoOut', price)

    let fields = []
    let desc = `${ctx.boldName(ctx.user.username)}, you claimed:\n`
    fields.push({name: `**New Cards**`, value: newCards.map(x => `${ctx.formatName(ctx, x.card)}`).join('\n')})
    fields.push({name: '**Duplicates**', value: ownedCards.map(x => `${ctx.formatName(ctx, x.card)} #${x.count}`).join('\n')})
    fields = fields.filter(x => x && x.value)

    fields = fields.map(x => {
        desc += x.name + '\n' + x.value + '\n'
    }).filter(x => !x && x)
    let max = 1
    while(calculateClaimCost(ctx, max, ctx.stats.promoClaims, true) < ctx.user.promoBal) {
        max++
    }
    fields.push({
        name: `Receipt`,
        value: `You spent **${ctx.fmtNum(price)}**${ctx.symbols.promo} in total
        You have ${ctx.boldName(ctx.fmtNum(ctx.user.promoBal))}${ctx.symbols.promo} remaining
        You can claim ${ctx.boldName(max - 1)} more cards today
        Your next claim will cost ${ctx.boldName(ctx.fmtNum(calculateClaimCost(ctx, 1, ctx.stats.promoClaims, true)))}${ctx.symbols.promo}`.replace(/\s\s+/gm, '\n')
    })

    const claim = new Claims()
    claim.claimID = generateNewID()
    claim.cardIDs = cardIDs
    claim.userID = ctx.user.userID
    claim.cost = price
    claim.promo = true
    await claim.save()
    _.pull(processing, ctx.user.userID)

    let pages = claimed.map(x => x.card.cardURL)
    return ctx.send(ctx, {
        embed: {
            image: {
                url: claimed[0].card.cardURL
            },
            description: desc,
            fields,
        },
        switchPage: (data) => data.embed.image.url = data.pages[data.pageNum],
        pages,
        edit: true,
    })
    return ctx.send(ctx, 'no', 'red')
}