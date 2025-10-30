const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['inventory'], async (ctx) => await inventoryStart(ctx))

const inventoryStart = async (ctx) => {}