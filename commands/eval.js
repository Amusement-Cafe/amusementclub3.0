const {
    cmd,
} = require('../utils/cmd')

cmd(['eval', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}