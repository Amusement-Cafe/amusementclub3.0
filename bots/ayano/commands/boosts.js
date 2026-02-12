const {registerBotCommand} = require('../../../utils/commandRegistrar')

const Promo = require('../../../db/promo')


registerBotCommand(['create', 'promo'], async (ctx) => {
    if (!ctx.globalCards.length) {
        return ctx.send(ctx, `No cards found matching your query to add as promo!`, 'red')
    }
    const promo = new Promo()
    promo.promoID = ctx.globalCards[0].collectionID
    promo.promoName = ctx.collections.find(x => x.collectionID === ctx.globalCards[0].collectionID).name
    promo.starts = new Date(ctx.args.start)
    promo.expires = new Date(ctx.args.end)
    promo.cardIDs = ctx.globalCards.map(x => x.cardID)
    await promo.save()
    await ctx.send(ctx, `Created promo for ${ctx.boldName(promo.promoName)}, starting ${promo.starts.toDateString()} and ending ${promo.expires.toDateString()}!`)
    return process.send({refreshCTX: true})
}, {globalCards: true})