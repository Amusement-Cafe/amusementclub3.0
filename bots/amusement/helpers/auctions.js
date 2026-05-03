const Auctions = require('../../../db/auction')
const AuctionQueue = require('../../../db/auctionQueue')

const {
    generateNewID,
    encodeUUID,
} = require("../../../utils/misc")

const {
    fetchUser
} = require("./user")

const {
    addUserCards,
} = require("./userCard")


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
    const auctionToFinish = await Auctions.findOneAndUpdate({ended: false, expires: {$lt: new Date()}}, {ended: true}, {returnDocument: "after"})
    if (!auctionToFinish) {
        return
    }
    let seller = await fetchUser(auctionToFinish.userID)
    if (!auctionToFinish.lastBidderID) {
        await addUserCards(seller.userID, [auctionToFinish.cardID])
        if (seller.preferences.notify.aucEnd) {
            return ctx.sendDM(ctx, seller, `Your auction for ${ctx.formatName(ctx, ctx.cards[auctionToFinish.cardID])} has now ended! No on bid on it and it has been returned to you.`, ctx.colors.yellow)
        }
        return
    }
    const bidder = await fetchUser(auctionToFinish.lastBidderID)
    const tomatoReturn = auctionToFinish.highBid - auctionToFinish.price
    bidder.tomatoes += tomatoReturn
    await bidder.save()
    seller.tomatoes += auctionToFinish.price
    await seller.save()

    try {
        if (seller.preferences.notify.aucEnd) {
            await ctx.sendDM(ctx, seller, `Your auction for ${ctx.formatName(ctx, ctx.cards[auctionToFinish.cardID])} has now ended! The highest bidder, ${ctx.boldName(bidder.username)}, has won and you have been paid ${ctx.boldName(ctx.fmtNum(auctionToFinish.price))}${ctx.symbols.tomato}.`, ctx.colors.green)
        }
        await ctx.sendDM(ctx, bidder, `You have won the auction for ${ctx.formatName(ctx, ctx.cards[auctionToFinish.cardID])} for ${ctx.boldName(ctx.fmtNum(auctionToFinish.price))}${ctx.symbols.tomato}! You have had ${ctx.boldName(ctx.fmtNum(tomatoReturn))}${ctx.symbols.tomato} returned and you now have ${ctx.boldName(ctx.fmtNum(bidder.tomatoes))}${ctx.symbols.tomato} tomatoes.`, ctx.colors.green)
    } catch (e) {
        console.log(e)
    }
}

const listAuctionEmbedRows = (ctx, aucList) => {
    return aucList.map(x => {
        const icon = x.userID === ctx.user.userID? x.lastBidderID? ctx.symbols.auctionHasBid: ctx.symbols.auctionNoBid: x.lastBidderID === ctx.user.userID? ctx.symbols.auctionOwn: ctx.symbols.auctionIcon
        const card = ctx.cards[x.cardID]
        const timeRemaining = ctx.timeDisplay(ctx, x.expires)
        return `${icon} [~${timeRemaining}] [${ctx.fmtNum(x.price)}${ctx.symbols.tomato}] ${ctx.formatName(ctx, card)}`
    })
}

const createAuctionInfoEmbed = async (ctx, auction, {total, page}) => {
    const seller = await fetchUser(auction.userID)
    const card = ctx.cards[auction.cardID]
    ctx.args.fmtOptions = {locked: false, fav: false, amount: false, eval: false}
    const cardName = ctx.formatName(ctx, card)

    return {
        image: {url: card.cardURL},
        description: [
            `Seller: ${ctx.boldName(seller.username)}`,
            `Price: ${ctx.boldName(ctx.fmtNum(auction.price))}${ctx.symbols.tomato}`,
            `Card: ${cardName}`,
            `Card Value: ${ctx.boldName(ctx.fmtNum(card.eval))}${ctx.symbols.tomato}`,
            `Expires in: ${ctx.timeDisplay(ctx, auction.expires)}`,
        ].join('\n'),
        footer: { text: `Auction ${encodeUUID(auction.auctionID)} · Page ${page + 1}/${total}`},
        color: ctx.colors.blue
    }
}

module.exports = {
    createAuction,
    finishAuction,
    listAuctionEmbedRows,
    createAuctionInfoEmbed,
}