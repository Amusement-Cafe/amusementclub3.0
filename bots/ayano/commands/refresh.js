const {registerBotCommand} = require("../../../utils/commandRegistrar");


registerBotCommand(['refresh', 'commands'], async (ctx) => {
    let slashCommands = require('../static/commands.json')
    await ctx.bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.commands)
    await ctx.send(ctx, 'refreshing slash commands!')
})