const {
    UserStats,
} = require('../collections')

const getStats = async (user, daily, lean = false) => {
    let userStats

    if (lean)
        userStats = await UserStats.findOne({ userID: user.userID, daily: daily}).lean()
    else
        userStats = await UserStats.findOne({ userID: user.userID, daily: daily})

    if (!userStats) {
        userStats = new UserStats()
        userStats.userID = user.userID
        userStats.username = user.username
        userStats.daily = daily || user.lastDaily
        await userStats.save()
    }

    return userStats
}

const getAllStats = async (user) => UserStats.find({userID: user.userID}).lean()

const getTimedStats = async (user, startDate = new Date(0)) => UserStats.find({userID: user.userID, daily: {$gte: startDate}}).lean()

const saveStatsAndCheck = async (ctx, user, stats) => {
    await stats.save()
}

module.exports = {
    getAllStats,
    getStats,
    getTimedStats,
    saveStatsAndCheck,
}