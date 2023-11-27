const {
    cmd,
} = require('../utils/cmd')

cmd(['leaderboard', 'tomatoes'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'tomatoes', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'vials'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'vials', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'lemons'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'lemons', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'cards'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'cards', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'clout'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'clout', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'completed'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'completed', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'level'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['leaderboard', 'level', 'local'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'leaderboard command'})
}