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

const getAllUserStats = async (ctx) => UserStats.find({userID: ctx.user.userID}).lean()

const updateUserStats = async (ctx, stat, amount, statObject) => {
    let update = statObject || ctx.stats
    update[stat] += amount
    await update.save()
}

const createUserStats = async (ctx) => {
    const stats = new UserStats()
    stats.daily = ctx.user.lastDaily
    stats.userID = ctx.user.userID
    await stats.save()

    return stats
}

const getSpecificUserStats = async (ctx, userID) => UserStats.find({userID: userID})

const mapStatToName = (ctx, stat, count) => {
    count = ctx.fmtNum(count)
    switch (stat) {
        case 'claims': return {name: 'Card Claims', count: count}
        case 'promoClaims': return {name: 'Promo Claims', count: count}
        case 'totalRegularClaims': return {name: 'Total Normal Claims', count: count}
        case 'aucSell': return {name: 'Auction Sales', count: count}
        case 'aucBid': return {name: 'Auction Bids', count: count}
        case 'aucWin': return {name: 'Auction Wins', count: count}
        case 'liquefy': return {name: 'Total Liquefied', count: count}
        case 'liquefy1': return {name: '1 Star Liquefied', count: count}
        case 'liquefy2': return {name: '2 Star Liquefied', count: count}
        case 'liquefy3': return {name: '3 Star Liquefied', count: count}
        case 'draw': return {name: 'Total Drawn', count: count}
        case 'draw1': return {name: '1 Star Drawn', count: count}
        case 'draw2': return {name: '2 Star Drawn', count: count}
        case 'draw3': return {name: '3 Star Drawn', count: count}
        case 'forge': return {name: 'Total Forged', count: count}
        case 'forge1': return {name: '1 Star Forged', count: count}
        case 'forge2': return {name: '2 Star Forged', count: count}
        case 'forge3': return {name: '3 Star Forged', count: count}
        case 'forge4': return {name: '4 Star Forged', count: count}
        case 'tags': return {name: 'Tags', count: count}
        case 'rates': return {name: 'Cards Rated', count: count}
        case 'wish': return {name: 'Cards Wished For', count: count}
        case 'userSell': return {name: 'Sales to Users', count: count}
        case 'botSell': return {name: 'Sales to Bot', count: count}
        case 'userBuy': return {name: 'Cards Bought', count: count}
        case 'tomatoIn': return {name: 'Tomatoes Earned', count: count}
        case 'tomatoOut': return {name: 'Tomatoes Spent', count: count}
        case 'promoIn': return {name: 'Promo Earned', count: count}
        case 'promoOut': return {name: 'Promo Spent', count: count}
        case 'vialIn': return {name: 'Vials Earned', count: count}
        case 'vialOut': return {name: 'Vials Spent', count: count}
        case 'lemonIn': return {name: 'Lemons Earned', count: count}
        case 'lemonOut': return {name: 'Lemons Spent', count: count}
        case 'store': return {name: 'Total Store Purchases', count: count}
        case 'storePlot': return {name: 'Purchases from Plot Store', count: count}
        case 'storeRecipe': return {name: 'Purchases from Recipe Store', count: count}
        case 'storeTicket': return {name: 'Purchases from Ticket Store', count: count}
        case 'storeBonus': return {name: 'Purchases from Bonus Store', count: count}
        case 't1Quests': return {name: 'T1 Quests Completed', count: count}
        case 't2Quests': return {name: 'T2 Quests Completed', count: count}
        case 't3Quests': return {name: 'T3 Quests Completed', count: count}
        case 't4Quests': return {name: 'T4 Quests Completed', count: count}
        case 't5Quests': return {name: 'T5 Quests Completed', count: count}
        case 't6Quests': return {name: 'T6 Quests Completed', count: count}
        case 'totalDailies': return {name: 'Total Dailies', count: count}
    }
}

module.exports = {
    createUserStats,
    getUserStats,
    getAllUserStats,
    getSpecificUserStats,
    mapStatToName,
    updateUserStats,
}