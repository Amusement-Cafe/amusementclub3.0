const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand('daily', async (ctx) => await daily(ctx), {perms: []})

registerBotCommand('balance', async (ctx) => await balance(ctx))

const daily = async (ctx) => {
    ctx.user.tomatoes += 1
    await ctx.send(ctx, `You have claimed daily! You now have ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes!`)
    await ctx.user.save()
}

const balance = async (ctx) => {
    await ctx.send(ctx, `Your balance is currently ${ctx.fmtNum(ctx.user.tomatoes)} tomatoes.\n~~I'll re-add symbols soon-ish~~`)
}