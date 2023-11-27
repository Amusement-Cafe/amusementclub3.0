const {
    cmd,
} = require('../utils/cmd')

cmd(['claim', 'cards'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['claim', 'history'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['claim', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('summon', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['cards', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['sell', 'preview'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['eval', 'many', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['fav', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['boost', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['boost', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['rate', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['wish', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['lock', 'remove', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))




const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'card command'})
}