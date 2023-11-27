const {
    cmd,
} = require('../utils/cmd')

cmd('daily', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('cards', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('balance', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('profile', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('has', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('miss', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('stats', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('achievements', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('vote', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('todo', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'use'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'from'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'for'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))




const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'user command'})
}