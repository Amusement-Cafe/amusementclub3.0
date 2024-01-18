const _ = require('lodash')

const {
    cmd,
} = require('../utils/cmd')

const {
    addUserCards,
    formatCard,
    withCards,
} = require('../modules/card')


cmd(['claim', 'cards'], async (ctx, user, args) => await claimNormal(ctx, user, args))

cmd(['claim', 'history'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['claim', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('summon', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['cards', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'preview'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['boost', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['boost', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const claimNormal = withCards(async (ctx, user, args, cardstuff) => {
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

    await addUserCards(ctx, user, cards.map(x => x.card.id))

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

})

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}