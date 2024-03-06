const {
    Auctions,
} = require("../collections")

const {
    cmd,
} = require('../utils/cmd')

const {
    formatAuctionTime,
    formatAuctionInfo,
    newAuction, bidAuction,
} = require('../modules/auction')

const {
    formatCard,
    withCards,
} = require('../modules/card')

const {
    getSpecificUserCards,
} = require("../modules/usercards")


cmd(['auction', 'info'], async (ctx, user, args) => await auctionInfo(ctx, user, args))

cmd(['auction', 'list'], async (ctx, user, args) => await auctionList(ctx, user, args))

cmd(['auction', 'preview'], async (ctx, user, args) => await auctionPreview(ctx, user, args))

cmd(['auction', 'bid'], async (ctx, user, args) => await auctionBid(ctx, user, args), {ephemeral: true})

cmd(['auction', 'sell'], async (ctx, user, args) => await auctionSell(ctx, user, args))

cmd(['auction', 'cancel'], async (ctx, user, args) => await auctionCancel(ctx, user, args))


const auctionInfo = async (ctx, user, args) => {
    const auction = await Auctions.findOne({ auctionID: args.aucID })

    if (!auction)
        return ctx.reply(user, `auction with ID \`${args.aucID}\` was not found!`, 'red')

    const description = await formatAuctionInfo(ctx, auction)
    return ctx.send(ctx, user, {
        embed: {
            title: `Auction [${auction.auctionID}]`,
            image: { url: ctx.cards[auction.cardID].url },
            description,
            color: ctx.colors['blue']
        }
    })
}

const auctionList = withCards(async (ctx, user, args, cards) => {
    const req = { ended: false }

    if (args.me)
        req.userID = user.userID

    let list = (await Auctions.find(req).sort({ expires: 1 })).filter(x => x.expires > new Date())

    if (!args.me && args.me !== undefined)
        list = list.filter(x => x.userID !== user.userID)

    if (args.diff) {
        const userCards = await getSpecificUserCards(user, list.map(x => x.cardID), true)
        list = list.filter(x => args.diff == 1 ^ userCards.some(y => y.cardID === x.cardID))
    }

    if (args.bid)
        list = list.filter(x => x.lastBidderID && x.lastBidderID === user.userID)
    else if (!args.bid && args.bid !== undefined)
        list = list.filter(x => !x.lastBidderID || x.lastBidderID !== user.userID)

    if (args.cardQuery)
        list = list.filter(x => cards.some(y => y.id === x.cardID))

    if (list.length === 0)
        return ctx.reply(user, `found 0 active auctions with your query!`, 'red')

    list = list.slice(0, 250)

    const pages = list.map(x => {
        let char = ctx.symbols.auc_wss

        if (x.userID === user.userID)
            char = x.lastBidderID? ctx.symbols.auc_lbd: ctx.symbols.auc_sbd
        else if (x.lastBidderID === user.userID)
            char = ctx.symbols.auc_sod

        return `${char} [${formatAuctionTime(x.expires, true)}] \`${x.auctionID}\` [${x.price}${ctx.symbols.tomatoes}] ${formatCard(ctx, ctx.cards[x.cardID])}`
    })

    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(pages, 15),
        embed: {
            author: { name: `${user.username}, found ${list.length} auctions`}
        }

    })
}, {global: true})

const auctionPreview = async (ctx, user, args) => {
    const req = { ended: false }

    if (args.me)
        req.userID = user.userID

    let list = (await Auctions.find(req).sort({ expires: 1 })).filter(x => x.expires > new Date())

    if (!args.me && args.me !== undefined)
        list = list.filter(x => x.userID !== user.userID)

    if (args.diff) {
        const userCards = await getSpecificUserCards(user, list.map(x => x.cardID), true)
        list = list.filter(x => args.diff == 1 ^ userCards.some(y => y.cardID === x.cardID))
    }

    if (args.bid)
        list = list.filter(x => x.lastBidderID && x.lastBidderID === user.userID)
    else if (!args.bid && args.bid !== undefined)
        list = list.filter(x => !x.lastBidderID || x.lastBidderID !== user.userID)

    if (args.cardQuery)
        list = list.filter(x => cards.some(y => y.id === x.cardID))

    if (list.length === 0)
        return ctx.reply(user, `found 0 active auctions with your query!`, 'red')

    list = list.slice(0, 50)

    const pages = await Promise.all(list.map(async x => {
        const auctionFormat = await formatAuctionInfo(ctx, x, false)
        return {
            auctionID: x.auctionID,
            image: ctx.cards[x.cardID].url,
            description: auctionFormat
        }
    }))

    return ctx.sendInteraction(ctx, user, {
        pages,
        switchPage: (data) => {
            const page = data.pages[data.pagenum]
            data.embed.image.url = page.image
            data.embed.description = page.info
            data.embed.title = `Auction [${page.id}]`
        },
        embed: {
            title: 'Auction',
            image: { url: '' },
            description: 'loading',
            color: ctx.colors.blue
        }
    })
}

const auctionBid = async (ctx, user, args) => {
    if (user.ban.embargo)
        return ctx.reply(user, `you are not allowed to list cards at auction.
                                Your dealings were found to be in violation of our community rules.
                                You can inquire further on our [Bot Discord](${ctx.cafe})`, 'red')

    const auction = await Auctions.findOne({ auctionID: args.aucID })

    if (!auction)
        return ctx.reply(user, `auction with ID \`${args.aucID}\` was not found!`, 'red')


    const bid = args.price
    const lastBidder = auction.lastBidderID === user.userID

    if ((!lastBidder && user.tomatoes < bid) || (lastBidder && user.tomatoes < bid - auction.highBid))
        return ctx.reply(user, `you don't have **${bid}**${ctx.symbols.tomatoes} to bid!`, 'red')

    if (auction.cancelled)
        return ctx.reply(user, `auction \`${auction.auctionID}\` was cancelled and is now finished`, 'red')

    if (auction.ended || auction.expires < new Date())
        return ctx.reply(user, `auction \`${auction.auctionID}\` has ended!`, 'red')

    if (auction.userID === user.userID)
        return ctx.reply(user, `you cannot bid on your own auction!`, 'red')

    if (auction.price >= bid)
        return ctx.reply(user, `your bid should be higher than **${auction.price}** ${ctx.symbols.tomatoes}`, 'red')

    if (lastBidder && bid <= auction.highBid)
        return ctx.reply(user, `you cannot re-bid at the same price or lower!`, 'red')

    lastBidder? await bidAuction(ctx, user, auction, bid, true): await bidAuction(ctx, user, auction, bid)
}

// To-do Buildings, Stats, Wishlist Notifs
const auctionSell = withCards(async (ctx, user, args, cards) => {
    if (ctx.settings.aucLock && !user.roles.some(x => x === 'admin'))
        return ctx.reply(user, `selling on auction is currently disabled by the admins.\nFor more info you may inquire in the [Support Server](${ctx.invite}).`, 'red')
    if (user.ban.embargo)
        return ctx.reply(user, `you are not allowed to list cards at auction.
                                Your dealings were found to be in violation of our community rules.
                                You can inquire further on our [Bot Discord](${ctx.cafe})`, 'red')

    if (!args.cardQuery?.locked)
        cards = cards.filter(x => !x.locked)

    if (cards.length === 0)
        return ctx.reply(user, `you are attempting to sell a locked card, or no longer own the card you are attempting to put on auction!`, 'red')

    const card = cards[0]
    const cardEval = 5
    let price = args.price || Math.round(cardEval)

    if (price < 4)
        price *= cardEval

    const fee = Math.round(price * (ctx.auctionFeePercent / 100))
    const min = Math.round(cardEval * .5)
    const max = Math.round(cardEval * 4)
    const hours = args.timeLength || 6

    const checks = async () => {
        const hasCard = await getSpecificUserCards(user, [card.id], true)

        if (!hasCard)
            return ctx.reply(user, `cannot setup auction! ${formatCard(ctx, card)} was not found in your card list!`, 'red', {edit:true})

        if (price < min)
            return ctx.reply(user, `a`, 'red', {edit:true})

        if (price > max)
            return ctx.reply(user, `b`, 'red', {edit:true})

        if (user.tomatoes < fee)
            return ctx.reply(user, `lol u broke`, 'red', {edit:true})

        if (hasCard.fav && hasCard.amount === 1)
            return ctx.reply(user, `c`, 'red', {edit:true})
    }

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `Do you want to sell ${formatCard(ctx, card)} on auction for ${price} ${ctx.symbols.tomatoes}? 
                          This auction will last **${hours} hours**
                          ${card.amount > 1? '' : 'This is the only copy that you have'}
                          ${(card.amount == 1 && card.rating)? 'You will lose your rating for this card' : ''}`,
            footer: { text: `This will cost ${fee} (${ctx.auctionFeePercent}% fee)`}
        },
        checks,
        onConfirm: async () => {
            const auc = await newAuction(ctx, user, card, price, fee, hours)

            if (!auc)
                return ctx.reply(user, `failed to create auction. Card might be missing or there was an internal server error.`, 'red', {edit:true})

            return ctx.reply(user, `you put ${formatCard(ctx, card)} on auction for **${price}** ${ctx.symbols.tomatoes}
                Auction ID: \`${auc.id}\``, 'green', {edit:true})
        }
    })
})
// To-do Stats
const auctionCancel = async (ctx, user, args) => {
    let auction = await Auctions.findOne({ auctionID: args.aucID })

    if (!auction)
        return ctx.reply(user, `auction with ID \`${args.aucID}\` was not found!`, 'red')

    const checks = async () => {
        auction = await Auctions.findOne({ auctionID: args.aucID })

        if (auction.userID !== user.userID)
            return ctx.reply(user, `you don't have the rights to cancel this auction`, 'red', {edit: true})

        if (auction.lastBidderID)
            return ctx.reply(user, `you cannot cancel this auction as someone has already placed a bit on it!`, 'red', {edit: true})

        if (auction.expires < ctx.subTime(new Date(), 30, 'minutes'))
            return ctx.reply(user, `you cannot cancel an auction that expires in less than 30 minutes!`, 'red', {edit: true})
    }

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `Do you want to cancel auction \`${auction.auctionID}\` for ${formatCard(ctx, ctx.cards[auction.cardID])}?`,
            footer: { text: `You will not get a refund for the listing fee!`}
        },
        checks,
        onConfirm: async () => {
            auction.expires = new Date(0)
            auction.cancelled = true
            await auction.save()

            return ctx.reply(user, `auction \`${auction.id}\` was marked for expiration. You will get your card back soon`, 'green', {edit: true})
        }
    })
}
