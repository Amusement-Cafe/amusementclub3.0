const {
    cmd,
} = require('../utils/cmd')

cmd(['lock', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}