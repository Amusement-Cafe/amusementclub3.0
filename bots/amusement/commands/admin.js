const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['refresh', 'global'], async (ctx) => await refresh(ctx), {perms: ['admin']})

registerBotCommand(['refresh', 'guild'],async (ctx) => await refresh(ctx, false), {perms: ['admin']})

const refresh = async (ctx, global = true) => {
    const slashCommands = require("../static/commands.json")

    if (!global) {
        await ctx.bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.general)
    } else {
        await ctx.bot.application.bulkEditGlobalCommands(slashCommands.admin)
    }

    return ctx.send(ctx, `updating ${global? 'global': 'admin'} commands!`)
}