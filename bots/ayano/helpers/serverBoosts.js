const {Users} = require("../../../db")

const {addUserCards} = require('../../amusement/helpers/userCard')

const updateMemberCache = async (bot, ctx) => {
    let guild = await bot.rest.guilds.get(ctx.config.ayano.adminGuildID)
    const mems = await guild.fetchMembers()
    for (const member of mems) {
        await updateServerBoosters(ctx, member)
    }
    console.log('Updated member cache')
}

const updateServerBoosters = async (ctx, member) => {
    const user = await Users.findOne({userID: member.id})
    if (!user) {
        return
    }
    if (user.boost.isServerBooster && !member.premiumSince) {
        user.boost.isServerBooster = false
        user.boost.boostStart = new Date(0)
        await user.save()
        await ctx.sendDM(ctx, user, `Your server boost has expired and you will no longer receive monthly rewards!`, ctx.colors.red)
        console.log(`[SERVER BOOST] ${member.user.globalName || member.user.username} has stopped boosting the server!`)
        return
    }
    if (user.boost.isServerBooster) {
        return
    }
    if (member.premiumSince) {
        user.boost.isServerBooster = true
        user.boost.boostStart = new Date(member.premiumSince)
        await user.save()
        await ctx.sendDM(ctx, user, `Thank you for boosting the main server! You can find where to select your monthly reward card in \`/preferences\` under the reward menu. Make sure to have this selected before a month is up or you won't receive a card!`, ctx.colors.green)
        console.log(`[SERVER BOOST] ${member.user.globalName || member.user.username} has boosted the server!`)
    }
}

const checkServerBoosters = async (ctx) => {
    const eligibleDate = new Date(Date.now() - (86400000 * 30))
    const boosters = await Users.find({'boost.isServerBooster': true})
    for (let user of boosters) {
        if (!user.boost.boostReward || new Date(user.boost.lastReward) > eligibleDate) {
            continue
        }
        user.boost.lastReward = new Date()
        await user.save()
        await addUserCards(user.userID, [user.boost.boostReward])
        await ctx.sendDM(ctx, user, `You have been awarded ${ctx.formatName(ctx, ctx.cards[user.boost.boostReward])} for boosting the main server! Thank you!`, ctx.colors.green)
    }
}

module.exports = {
    checkServerBoosters,
    updateMemberCache,
    updateServerBoosters,
}