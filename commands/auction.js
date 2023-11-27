const {
    cmd,
} = require('../utils/cmd')


cmd(['auction', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['auction', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['auction', 'preview'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['auction', 'bid'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['auction', 'sell'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['auction', 'cancel'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'auction command'})
}