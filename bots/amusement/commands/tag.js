const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['tag', 'info'], async (ctx) => await tagInfo(ctx))

registerBotCommand(['tag', 'one'], async (ctx) => await tagCard(ctx))

registerBotCommand(['tag', 'many'], async (ctx) => await tagCard(ctx, true))

registerBotCommand(['tag', 'down'], async (ctx) => await tagDown(ctx))

registerBotCommand(['tag', 'list'], async (ctx) => await tagList(ctx))

registerBotCommand(['tag', 'created'], async (ctx) => await tagCreated(ctx))


const tagInfo = async (ctx) => {}

const tagCard = async (ctx, many = false) => {}

const tagDown = async (ctx) => {}

const tagList = async (ctx) => {}

const tagCreated = async (ctx) => {}

