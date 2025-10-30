const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['preferences'], async (ctx) => await preferencesStart(ctx))


const preferencesStart = async (ctx) => {}