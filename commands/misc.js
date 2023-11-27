const {
    cmd,
} = require('../utils/cmd')

cmd('help', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('rules', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('report', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('kofi', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('announcement', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('baka', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('pat', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('invite', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('license', async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'misc command'})
}