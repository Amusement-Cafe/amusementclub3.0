const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {generateGlobalCommand} = require("../../../utils/commandGeneration")
const Auctions = require("../../../db/auction")


registerBotCommand(['auction', 'sell', 'one'], async (ctx) => await auctionSell(ctx))
registerBotCommand(['auction', 'sell', 'many'], async (ctx) => await auctionSell(ctx, true))
registerBotCommand(['auction', 'list'], async (ctx) => await listAuctions(ctx))

generateGlobalCommand('auction', 'Top Level Auction')
    .subCommand('list', 'List current active auctions')
    .cardQuery()
    .boolean('me', 'Filter only for your auctions')
    .boolean('bid', 'Filter only for auctions you have bid on')
    .close()
    .subCommandGroup('sell', 'Top Level Sell')
    .subCommand('one', 'Auction a single card')
    .cardQuery()
    .required()
    .number('starting_bid', 'Set the starting bid for the auction, set either a whole number or 0.5-4.0 for an easy multiplier')
    .integer('time_length', 'Set the length of time in hours the auction will last')
    .minValue(1)
    .maxValue(48)
    .close()
    .subCommand('many', 'Auction a single copy of multiple cards')
    .cardQuery()
    .required()
    .number('starting_bid', 'Set the starting bid for the auction, set either a whole number or 0.5-4.0 for an easy multiplier')
    .integer('time_length', 'Set the length of time in hours the auction will last')
    .minValue(1)
    .maxValue(48)
    .close()

const auctionSell = async (ctx, many = false) => {
    console.log(ctx)
    console.log(many)
    return ctx.send(ctx, `logged`)
}

const listAuctions = async (ctx) => {
    const activeAuctions = await Auctions.find({ended: false})
    console.log(activeAuctions)
    return ctx.send(ctx, `${activeAuctions.length} auctions`)
}

const auctionBid = async (ctx) => {}

const auctionCancel = async (ctx) => {}

const auctionInfo = async (ctx) => {}

const auctionPreview = async (ctx) => {}