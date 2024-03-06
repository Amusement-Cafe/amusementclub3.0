const {
    cmd,
} = require('../utils/cmd')


cmd(['fav', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}