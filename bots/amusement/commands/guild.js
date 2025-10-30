const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['guild', 'info'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'donate'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'set', 'tax'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'set', 'report'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'add', 'manager'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'remove', 'manager'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'lock'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'unlock'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'convert'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'structure', 'upgrade'], async (ctx) => await (ctx))

registerBotCommand(['guild', 'structure', 'downgrade'], async (ctx) => await (ctx))
