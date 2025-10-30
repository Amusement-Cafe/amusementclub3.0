const {
    registerBotCommand
} = require('../../../utils/commandRegistrar')

registerBotCommand('stats', async (ctx) => await stats(ctx))

const stats = async (ctx) => {}