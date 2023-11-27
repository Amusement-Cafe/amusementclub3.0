const {
    cmd,
} = require('../utils/cmd')

cmd(['plot', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'list', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'buy'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'upgrade'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'info', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'collect'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'demolish'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['plot', 'demolish', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'plot command'})
}