const {
    cmd,
    pcmd,
} = require('../utils/cmd')

cmd('info', async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'guess'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'scan'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'set', 'booru'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'set', 'source'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'meta command'})
}