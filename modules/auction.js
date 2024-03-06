const {
    fetchUser
} = require('./user')

const {
    formatCard,
} = require("./card")

const {
    getEval,
} = require("./eval")

const newAuction = async (ctx, user, card, price, fee, hours) => {
    return true
}

const bidAuction = async (ctx, user, auc, bid, add = false) => {
    return true
}

const formatAuctionTime = (time, compact = false) => {
    const timeToEndMS = time - new Date()

    if (timeToEndMS <= 0)
        return `0s`

    const hours = Math.floor((timeToEndMS / (1000 * 60)) / 60)
    const minutes = Math.floor((timeToEndMS / (1000 * 60)) % 60)

    if (hours === 0 && minutes <= 5)
        return `<5m`

    if (compact) {
        if (hours <= 0)
            return `~${minutes}m`
        if (minutes > 45)
            return `~${hours + 1}h`
        if (minutes < 15)
            return `~${hours}h`
        return `~${hours}.5h`
    }

    return `${hours <= 0? '': `${hours}h`} ${minutes}m`
}

const formatAuctionInfo = async (ctx, auction, withEval = true) => {
    const author = await fetchUser(auction.userID)

    const card = ctx.cards[auction.cardID]
    const timeDiffString = formatAuctionTime(auction.expires)

    const response = [
        `Seller: **${author.username}**`,
        `Price: **${auction.price}** ${ctx.symbols.tomatoes}`,
        `Card: ${formatCard(ctx, card)}`
    ]

    if (withEval)
        response.push(`Card Value: **${getEval(ctx, card)}** ${ctx.symbols.tomatoes}`)

    if (auction.cancelled)
        response.push(`**This auction was cancelled**`)
    else if (auction.ended && !auction.cancelled)
        response.push(`Winning bid: **${auction.highBid}**${ctx.symbols.tomatoes}\n**This auction has finished**`)
    else
        response.push(`Expires in **${timeDiffString}**`)

    return response.join('\n')
}

module.exports = {
    bidAuction,
    formatAuctionInfo,
    formatAuctionTime,
    newAuction
}