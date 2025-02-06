const {registerBotCommand} = require('../../../utils/commandRegistrar')
const slashCommands = require("../static/commands.json");

registerBotCommand(['refresh', 'global'], async (ctx) => {
    await ctx.bot.application.bulkEditGlobalCommands(slashCommands.admin)
    return ctx.send(ctx, 'updating global commands')
}, {perms: ['admin']})

registerBotCommand(['refresh', 'guild'], async (ctx) => {
    await ctx.bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.general)
    return ctx.send(ctx, 'updating global commands')
}, {perms: ['admin']})