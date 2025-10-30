const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand(['effect', 'list'], async (ctx) => await effectList(ctx))

registerBotCommand(['effect', 'use'], async (ctx) => await effectUse(ctx))

registerBotCommand(['effect', 'info'], async (ctx) => await effectInfo(ctx))

const effectList = async (ctx) => {}

const effectInfo = async (ctx) => {}

const effectUse = async (ctx) => {}