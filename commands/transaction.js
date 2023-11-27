const {
    cmd,
    pcmd,
} = require('../utils/cmd')

cmd(['transaction', 'confirm'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['transaction', 'decline'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['transaction', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['transaction', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['trans', 'find'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'transaction command'})
}