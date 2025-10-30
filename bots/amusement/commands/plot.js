const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['plot', 'list'], async (ctx) => await plotList(ctx))

registerBotCommand(['plot', 'list', 'global'], async (ctx) => await plotList(ctx, true))

registerBotCommand(['plot', 'buy'], async (ctx) => await plotBuy(ctx))

registerBotCommand(['plot', 'upgrade'], async (ctx) => await plotUpgrade(ctx))

registerBotCommand(['plot', 'info'], async (ctx) => await plotInfo(ctx))

registerBotCommand(['plot', 'info', 'global'], async (ctx) => await plotInfo(ctx, true))

registerBotCommand(['plot', 'collect'], async (ctx) => await plotCollect(ctx))

registerBotCommand(['plot', 'collect', 'global'], async (ctx) => await plotCollect(ctx, true))

registerBotCommand(['plot', 'demolish'], async (ctx) => await plotDemolish(ctx))

registerBotCommand(['plot', 'demolish', 'global'], async (ctx) => await plotDemolish(ctx, true))

const plotList = async (ctx, global = false) => {}

const plotBuy = async (ctx) => {}

const plotUpgrade = async (ctx) => {}

const plotInfo = async (ctx, global = false) => {}

const plotCollect = async (ctx, global = false) => {}

const plotDemolish = async (ctx, global = false) => {}