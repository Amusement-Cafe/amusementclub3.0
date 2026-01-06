const {
    UserStats
} = require('../../../db')


const getUserStats = async (ctx) => {
    let userStats = await UserStats.findOne({userID: ctx.user.userID, daily: ctx.user.lastDaily})
    if (!userStats) {
        userStats = await createUserStats(ctx)
    }
    return userStats
}

const getAllUserStats = async (ctx) => UserStats.find({userID: ctx.user.userID})

const updateUserStats = async (ctx, stat, amount) => {
    ctx.stats[stat] += amount
    await ctx.stats.save()
}

const createUserStats = async (ctx) => {
    const stats = new UserStats()
    stats.daily = ctx.user.lastDaily
    stats.userID = ctx.user.userID
    await stats.save()

    return stats
}

module.exports = {
    createUserStats,
    getUserStats,
    getAllUserStats,
    updateUserStats,
}