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

registerBotCommand(['claim'], async (ctx) => await claimNormal(ctx), {withCards: true})

const claimNormal = async (ctx) => {

    let claimRNG = Math.random() * 100

    ctx.collections = ctx.collections.filter(x => x.inClaimPool)
    ctx.cards = ctx.cards.filter(x => ctx.collections.some(y => y.collectionID === x.collectionID))
    const claims = ctx.args.count || 1
    const price = calculateClaimCost(ctx, claims)
    if (price > ctx.user.tomatoes) {
        return ctx.send(ctx, `you have an insufficient tomato balance to claim ${claims} cards!`, 'red')
    }
    console.log(price)
    let claimed = []
    let descriptionText = ``
    for (let i = 0; i < claims; i++) {
        let card = _.sample(ctx.cards)
        claimed.push(card)
    }
    claimed.sort((a, b) => b.rarity - a.rarity).map(card => descriptionText += `${ctx.formatName(ctx, card)}\n`)

    await addUserCards(ctx, claimed.map(x => x.cardID))
    return ctx.send(ctx, {
        embed: {
            image: {
                url: claimed[0].cardURL
            },
            description: `You claimed:\n${descriptionText}`
        },
        switchPage: (data) => data.embed.image.url = data.pages[data.pageNum],
        pages: claimed.map(x => x.cardURL)
    })
}