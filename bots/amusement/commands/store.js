const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['store'], async (ctx) => await storeStart(ctx))

const storeStart = async (ctx) => {}