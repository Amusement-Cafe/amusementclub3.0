const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand('help', async (ctx) => await helpStart(ctx))

const helpStart = async (ctx) => {
    return ctx.send(ctx, `The help menu is currently a WIP and subject to change at any time. At this time, you have no help menu.`, 'red')
}