const {
    cmd,
} = require('../utils/cmd')

cmd(['collection', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['collection', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['collection', 'reset'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'collection command'})
}