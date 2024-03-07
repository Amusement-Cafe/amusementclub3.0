const {
    cmd,
} = require('../utils/cmd')
//To-Do Backend Leaderboards

cmd(['leaderboard', 'tomatoes'], async (ctx, user, args) => await leaderboardTomatoes(ctx, user, args, false))

cmd(['leaderboard', 'tomatoes', 'global'], async (ctx, user, args) => await leaderboardTomatoes(ctx, user, args, true))

cmd(['leaderboard', 'vials'], async (ctx, user, args) => await leaderboardVials(ctx, user, args, false))

cmd(['leaderboard', 'vials', 'global'], async (ctx, user, args) => await leaderboardVials(ctx, user, args, true))

cmd(['leaderboard', 'lemons'], async (ctx, user, args) => await leaderboardLemons(ctx, user, args, false))

cmd(['leaderboard', 'lemons', 'global'], async (ctx, user, args) => await leaderboardLemons(ctx, user, args, true))

cmd(['leaderboard', 'cards'], async (ctx, user, args) => await leaderboardCards(ctx, user, args, false))

cmd(['leaderboard', 'cards', 'global'], async (ctx, user, args) => await leaderboardCards(ctx, user, args, true))

cmd(['leaderboard', 'clout'], async (ctx, user, args) => await leaderboardClout(ctx, user, args, false))

cmd(['leaderboard', 'clout', 'global'], async (ctx, user, args) => await leaderboardClout(ctx, user, args, true))

cmd(['leaderboard', 'completed'], async (ctx, user, args) => await leaderboardCompleted(ctx, user, args, false))

cmd(['leaderboard', 'completed', 'global'], async (ctx, user, args) => await leaderboardCompleted(ctx, user, args, true))

cmd(['leaderboard', 'level'], async (ctx, user, args) => await leaderboardLevel(ctx, user, args, false))

cmd(['leaderboard', 'level', 'global'], async (ctx, user, args) => await leaderboardLevel(ctx, user, args, true))

const leaderboardTomatoes = async (ctx, user, args, global) => {}

const leaderboardVials = async (ctx, user, args, global) => {}

const leaderboardLemons = async (ctx, user, args, global) => {}

const leaderboardCards = async (ctx, user, args, global) => {}

const leaderboardClout = async (ctx, user, args, global) => {}

const leaderboardCompleted = async (ctx, user, args, global) => {}

const leaderboardLevel = async (ctx, user, args, global) => {}
