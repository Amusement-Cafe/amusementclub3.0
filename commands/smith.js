const {
    cmd,
} = require('../utils/cmd')

cmd('forge', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('draw', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['liquefy', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['liquefy', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['liquefy', 'preview'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'smith command'})
}