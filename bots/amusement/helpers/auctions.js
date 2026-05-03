const Auctions = require('../../../db/auction')
const AuctionQueue = require('../../../db/auctionQueue')

const {
    generateNewID
} = require("../../../utils/misc")

const {
    fetchUser
} = require("./user")


const createAuction = async (ctx) => {
    const auctionToList = await AuctionQueue.findOneAndUpdate({paid: true, processing:false}, {processing: true}, {returnDocument: "after"})
    if (!auctionToList) {
        return
    }
    for (let cardID of auctionToList.cardIDs) {
        let expiryTime = new Date().getTime()
        let price = 0
        if (auctionToList.listPrice <= 5) {
            price = Math.round(ctx.cards[cardID].eval * auctionToList.listPrice)
        } else {
            price = auctionToList.listPrice
        }
        if (!price) {
            price = ctx.cards[cardID].eval
        }
        const newAuction = new Auctions()
        newAuction.auctionID = generateNewID()
        newAuction.guildID = auctionToList.guildID
        newAuction.userID = auctionToList.userID
        newAuction.price = price
        newAuction.highBid = price
        newAuction.cardID = cardID
        newAuction.expires = new Date(expiryTime + Math.round(1000 * 60 * 60 * auctionToList.timeLength))
        newAuction.time = new Date()
        await newAuction.save()
    }
    const user = await fetchUser(auctionToList.userID)
    if (user.preferences.notify.aucCreated) {
        await ctx.sendDM(ctx, user, `The auctions you have queued for listing [here](https://discord.com/channels/${auctionToList.guildID}/${auctionToList.channelID}/${auctionToList.messageID}) have now all been listed successfully.`, 1142316)
    }
}

const finishAuction = async (ctx) => {
    const auctionToFinish = await Auctions.findOne({expires: {$lt: new Date()}})
    if (!auctionToFinish) {
        return
    }

}

const cancelAuction = async () => {

}

const listAuctionEmbedRows = (ctx, aucList) => {
    return aucList.map(x => {
        const icon = x.userID === ctx.user.userID? x.highestBidderID? ctx.symbols.auctionHasBid: ctx.symbols.auctionNoBid: x.highestBidderID === ctx.user.userID? ctx.symbols.auctionOwn: ctx.symbols.auctionIcon
        const card = ctx.cards[x.cardID]
        const timeRemaining = ctx.timeDisplay(ctx, x.expires)
        return `${icon} [${timeRemaining}] [${ctx.fmtNum(x.price)}${ctx.symbols.tomato}] ${ctx.formatName(ctx, card)}`
    })
}

const createAuctionInfoEmbed = async (ctx, auction, extra) => {

}

module.exports = {
    cancelAuction,
    createAuction,
    finishAuction,
    listAuctionEmbedRows,
    createAuctionInfoEmbed,
}