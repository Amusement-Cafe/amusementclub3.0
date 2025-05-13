const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand(['auction', 'sell', 'one'], async (ctx) => {})

registerBotCommand(['auction', 'sell', 'many'], async (ctx) => {})

registerBotCommand(['auction', 'list'], async (ctx) => {})

registerBotCommand(['auction', 'bid'], async (ctx) => {})

registerBotCommand(['auction', 'cancel'], async (ctx) => {})

registerBotCommand(['auction', 'info'], async (ctx) => {})

registerBotCommand(['auction', 'preview'], async (ctx) => {})

const auctionSell = async (ctx) => {}

const listAuctions = async (ctx) => {}

const auctionBid = async (ctx) => {}

const auctionCancel = async (ctx) => {}

const auctionInfo = async (ctx) => {}

const auctionPreview = async (ctx) => {}
