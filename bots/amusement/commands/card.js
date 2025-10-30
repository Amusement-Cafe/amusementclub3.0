const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand('info', async (ctx) => await cardInfo(ctx))

const cardInfo = async (ctx) => {}