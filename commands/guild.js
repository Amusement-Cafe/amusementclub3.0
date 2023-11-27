const {
    cmd,
} = require('../utils/cmd')

cmd(['guild', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'status'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'donate'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'set', 'tax'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'set', 'report'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'manager', 'add'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'manager', 'remove'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'lock'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'unlock'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'lead'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'convert'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'upgrade'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['guild', 'downgrade'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'guild command'})
}