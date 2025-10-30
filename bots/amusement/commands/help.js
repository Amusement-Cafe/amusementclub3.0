const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand('help', async (ctx) => await helpStart(ctx))

const helpStart = async (ctx) => {}