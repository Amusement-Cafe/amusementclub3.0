const {
    cmd,
} = require('../utils/cmd')

cmd(['store', 'view'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['store', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['store', 'buy'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'store command'})
}