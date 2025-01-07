const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand('daily', async (ctx, options, extras) => {
    extras.user.tomatoes += 1
    await extras.interaction.reply({content:`You have claimed daily! You now have ${ctx.fmtNum(extras.user.tomatoes)} tomatoes!`})
    await extras.user.save()

}, {perms: []})

registerBotCommand('balance', async (ctx, options, extras) => {
    await extras.interaction.reply({content:`Your balance is currently ${ctx.fmtNum(extras.user.tomatoes)} tomatoes.\n~~I'll re-add symbols soon-ish~~`})
})