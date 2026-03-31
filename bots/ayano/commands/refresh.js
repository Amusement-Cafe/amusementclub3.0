const {registerBotCommand} = require("../../../utils/commandRegistrar")
const {
    generateGlobalCommand,
    getGlobalCommands,
} = require("../../../utils/commandGeneration")


registerBotCommand(['refresh', 'commands'], async (ctx) => await refreshCommands(ctx))
generateGlobalCommand('refresh', 'Top Level Refresh')
    .subCommand('commands', `Refresh Ayano's commands`)
    .close()

const refreshCommands = async (ctx) => {
    await ctx.bot.application.bulkEditGuildCommands(ctx.config.ayano.adminGuildID, getGlobalCommands())
    await ctx.send(ctx, 'refreshing slash commands!')
}