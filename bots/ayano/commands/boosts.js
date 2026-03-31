const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {generateGlobalCommand} = require("../../../utils/commandGeneration")


const Promo = require('../../../db/promo')


registerBotCommand(['create', 'promo'], async (ctx) => await createPromo(ctx), {globalCards: true})
generateGlobalCommand('create', 'Top Level Create')
    .subCommand('promo', 'Create a new promo event')
    .cardQuery()
    .required()
    .string('start_time', 'When the promo will start')
    .required()
    .string('end_time', 'When the promo will end')
    .required()
    .string('currency', 'The currency displayed for the promo event, default is ✨')
    .close()
    .subCommand('boost', 'Create a new boost event')
    .cardQuery()
    .required()
    .string('start_time', 'When the boost will start')
    .required()
    .string('end_time', 'When the boost will end')
    .required()
    .integer('drop_rate', 'The percentage chance that a card will drop from this boost, whole numbers only')
    .close()
    .subCommand('bonus', 'Create a new daily bonus event')
    .string('start_time', 'When the bonus will start')
    .required()
    .string('end_time', 'When the bonus will end')
    .required()
    .integer('bonus_amount', 'The amount the bonus provides to dailies')
    .required()
    .close()
    .subCommand('discount', 'Create a new claim discount event')
    .string('start_time', 'When the promo will start')
    .required()
    .string('end_time', 'When the promo will end')
    .required()
    .integer('discount_rate', 'The percentage off that claims will cost, whole numbers only')
    .close()

const createPromo = async (ctx) => {
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
}