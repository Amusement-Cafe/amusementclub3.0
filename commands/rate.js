const {
    cmd,
} = require('../utils/cmd')

cmd(['rate', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}