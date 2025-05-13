const {registerBotCommand} = require('../../../utils/commandRegistrar')
const _ = require("lodash");
const {addUserCards} = require("../helpers/userCard");

registerBotCommand(['claim'], async (ctx) => await claimNormal(ctx))

const claimNormal = async (ctx) => {
    ctx.collections = ctx.collections.filter(x => x.inClaimPool)
    ctx.cards = ctx.cards.filter(x => ctx.collections.some(y => y.collectionID === x.collectionID))
    const claims = ctx.args.count || 1
    let claimed = []
    let descriptionText = ``
    for (let i = 0; i < claims; i++) {
        let card = _.sample(ctx.cards)
        claimed.push(card)
        descriptionText += `${ctx.formatName(ctx, card)}\n`
    }

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