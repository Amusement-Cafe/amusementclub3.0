const {registerBotCommand} = require('../../../utils/commandRegistrar')
const _ = require("lodash");
const {addUserCards} = require("../helpers/userCard");

registerBotCommand(['claim'], async (ctx) => {
    ctx.collections = ctx.collections.filter(x => x.inClaimPool)
    ctx.cards = ctx.cards.filter(x => ctx.collections.some(y => y.collectionID === x.collectionID))
    let card = _.sample(ctx.cards)
    await addUserCards(ctx, [card.cardID])
    return ctx.send(ctx, {
        embed: {
            image: {
                url: card.cardURL
            },
            description: `You claimed ${ctx.formatName(ctx, card)}!`
        }
    })
})