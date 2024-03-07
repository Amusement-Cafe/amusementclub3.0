const {
    Plots
} = require('../collections')

const withPlots = (callback, global = false) => async (ctx, user, args) => {
    if (global === false && !ctx.discordGuild)
        return ctx.warnDM()

    let plots = await getUserPlots(user.userID, false, false, global)

    return callback(ctx, user, args, plots)
}

const getPlotCost = async (user, plotList) => {
    if (!plotList)
        plotList = await getUserPlots(user.userID, false, false, true)
    return 25 * (2 ** plotList.length)
}

const getLemonCap = async (user) => {
    const nextPlotCost = await getPlotCost(user)
    return nextPlotCost< 100000? 100000: nextPlotCost
}

const getUserPlots = async (userID, guildID, buildingID, global = false) => {
    const query = {userID: userID}
    if (!global && guildID)
        query.guildID = guildID
    if (buildingID)
        query['building.id'] = buildingID
    return Plots.find(query)
}

const getGuildPlots = async (guildID, buildingID) => {
    const query = {guildID: guildID}
    if (buildingID)
        query['building.id'] = buildingID
    return Plots.find(query)
}

module.exports = {
    getGuildPlots,
    getLemonCap,
    getPlotCost,
    getUserPlots,
    withPlots,
}