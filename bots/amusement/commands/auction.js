const {generateGlobalCommand} = require("../../../utils/commandGeneration")
const Auctions = require("../../../db/auction")
const AuctionQueue = require("../../../db/auctionQueue")

const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    removeUserCards,
    addUserCards
} = require("../helpers/userCard")

const {
    Button
} = require("../helpers/componentBuilders")

const {
    generateNewID,
    encodeUUID,
    decodeUUID
} = require("../../../utils/misc")

const {
    createAuctionInfoEmbed,
    listAuctionEmbedRows
} = require("../helpers/auctions")

const {
    fetchUser
} = require("../helpers/user")

let auctionPages = []

registerBotCommand(['auction', 'sell', 'one'], async (ctx) => await auctionSell(ctx))
registerBotCommand(['auction', 'sell', 'many'], async (ctx) => await auctionSell(ctx, true))
registerBotCommand(['auction', 'list'], async (ctx) => await listAuctions(ctx), {withGlobalCards: true})

registerReaction(['auction', 'cfm'], async (ctx) => await auctionConfirm(ctx), {withCards: true})
registerReaction(['auction', 'dcl'], async (ctx) => await auctionDecline(ctx))
registerReaction(['auction', 'success', 'view'], async (ctx) => await listAuctions(ctx, true), {withGlobalCards: true})
registerReaction(['auction', 'list'], async (ctx) => await listAuctionPage(ctx), {withGlobalCards: true})
registerReaction(['auction', 'info'], async (ctx) => await listAuctionInfo(ctx))
registerReaction(['auction', 'bid'], async (ctx) => await auctionBid(ctx))
registerReaction(['auction', 'bid', 'modal'], async (ctx) => await auctionBidModal(ctx))
registerReaction(['auction', 'view', 'bid'], async (ctx) => await auctionViewBidResponse(ctx), { ephemeral: true})
registerReaction(['auction', 'cancel'], async (ctx) => await auctionCancel(ctx))

generateGlobalCommand('auction', 'Top Level Auction')
    .subCommand('list', 'List current active auctions')
    .cardQuery()
    .string('sort_style', 'Change how the auctions are sorted')
    .addChoice('Time Ascending (Default)', 'time_asc')
    .addChoice('Time Descending', 'time_desc')
    .addChoice('Price Ascending', 'price_asc')
    .addChoice('Price Descending', 'price_desc')
    .boolean('me', 'Filter only for your auctions')
    .boolean('bid', 'Filter only for auctions you have bid on')
    .close()
    .subCommandGroup('sell', 'Top Level Sell')
    .subCommand('one', 'Auction a single card')
    .cardQuery()
    .required()
    .number('starting_bid', 'Set the starting bid for the auction, set either a whole number or 0.5-4.0 for an easy multiplier')
    .integer('time_length', 'Set the length of time in hours the auction will last')
    .minValue(1)
    .maxValue(48)
    .integer('amount', 'The amount of the specified card to auction, Default 1')
    .minValue(1)
    .close()
    .subCommand('many', 'Auction a single copy of multiple cards')
    .cardQuery()
    .required()
    .number('starting_bid', 'Set the starting bid for the auction, set either a whole number or 0.5-4.0 for an easy multiplier')
    .integer('time_length', 'Set the length of time in hours the auction will last')
    .minValue(1)
    .maxValue(48)
    .integer('amount', 'The amount of unique cards to sell from the query, default All')
    .minValue(1)
    .close()

const auctionSell = async (ctx, many = false) => {
    if (!ctx.userCards.length) {
        return ctx.send(ctx, `No cards found for card query \`${ctx.args.cardQuery.keywords.join(' ')}\`. Please check your cards and try again!`, 'red')
    }
    let auctionCards = [...ctx.userCards]
    if (!ctx.args.cardQuery?.locked) {
        auctionCards = auctionCards.filter(x => !x.locked)
    }
    if (auctionCards.length === 0) {
        return ctx.send(ctx, `You are attempting to auction a locked card and haven't used the -locked flag to enable their usage! Try your command again with -locked if you want to continue`, 'red')
    }
    if (!ctx.args.cardQuery?.fav) {
        auctionCards = auctionCards.filter(x => x.fav? x.amount > 1: true)
    }
    if (auctionCards.length === 0) {
        return ctx.send(ctx, `You are attempting to your last copy of favorited cards! Check your card query and try again. If you want to sell the last copy, add -fav to your query.`, 'red')
    }

    let queuePrep = []
    let limit = ctx.args?.amount ?? Infinity
    let price = ctx.args?.price || 0
    let length = ctx.args?.timeLength ?? 10
    let cost = 0
    let costBasis = 0.05
    if (many) {
        if (auctionCards.length > limit) {
            auctionCards = auctionCards.slice(0, limit)
        }
        if (price && price > 5) {
            return ctx.send(ctx, `You have attempted to set a price for all auctions instead of using the multiplier, set prices are restricted when using many. Please set a multiplier, or leave the option empty and try your command again.`, 'red')
        }
        for (let card of auctionCards) {
            cost += Math.round(card.eval * costBasis)
            queuePrep.push(card.cardID)
        }

    } else {
        auctionCards = [auctionCards.shift()]
        if (limit === Infinity) {
            limit = 1
        }
        if (auctionCards[0].amount < limit) {
            return ctx.send(ctx, `You do not have enough ${ctx.formatName(ctx, auctionCards[0])} to list as you are trying to list ${ctx.boldName(limit)} of them and you only own ${ctx.boldName(auctionCards[0].amount)}`, 'red')
        }
        if (auctionCards[0].fav && auctionCards[0].amount <= limit) {
            return ctx.send(ctx, `You are attempting to auction all of a favorite card! Reduce your amount of cards being auctioned by 1 and try again.`, 'red')
        }
        for (let i = 0; i < limit; i++) {
            cost += Math.round(auctionCards[0].eval * costBasis)
            queuePrep.push(auctionCards[0].cardID)
        }
    }
    if (ctx.user.tomatoes < cost) {
        return ctx.send(ctx, `You don't have enough tomatoes to auction your query! This auction query costs ${ctx.boldName(ctx.fmtNum(cost))} and you only have ${ctx.boldName(ctx.fmtNum(ctx.user.tomatoes))}!`, 'red')
    }
    let msg = await ctx.send(ctx, 'Processing...', 'yellow')

    const newAucQueue = new AuctionQueue()
    newAucQueue.userID = ctx.user.userID
    newAucQueue.guildID = ctx.guild.guildID
    newAucQueue.channelID = ctx.interaction.channel.id
    newAucQueue.messageID = msg.message.id
    newAucQueue.cardIDs = queuePrep
    newAucQueue.timeLength = length
    newAucQueue.listPrice = price
    newAucQueue.limit = limit
    await newAucQueue.save()

    const pages = queuePrep.map(x => ctx.formatName(ctx, ctx.cards[x]))
    if (ctx.user.preferences.interact.alwaysForce) {
        ctx.user.tomatoes -= cost
        await ctx.updateStat(ctx, 'tomatoOut', cost)
        await ctx.user.save()
        newAucQueue.paid = true
        await newAucQueue.save()
        await removeUserCards(ctx.user.userID, queuePrep, 1)
        return ctx.send(ctx, {
            pages: ctx.getPages(pages),
            embed: {
                title: `You have auctioned ${many? `${auctionCards.length} cards`: `${limit > 1? `${limit} copies of `: ``}1 card`} and spent ${ctx.fmtNum(cost)}${ctx.symbols.tomato}`
            },
            edit: true
        })
    }
    const cfmButton = new Button(`auction_cfm-${cost}-${msg.message.id}-${ctx.user.userID}-${many}`).setLabel('Confirm').setStyle(3)
    const dclButton = new Button(`auction_dcl-${cost}-${msg.message.id}-${ctx.user.userID}-${many}`).setLabel('Decline').setStyle(4)
    return ctx.send(ctx, {
        pages: ctx.getPages(pages),
        embed: {
            title: `You are about to auction ${many? `${auctionCards.length} cards`: `${limit > 1? `${limit} copies of `: ``}1 card`}\nThis will cost you ${cost}${ctx.symbols.tomato} to list`,
        },
        customButtons: [cfmButton, dclButton],
        edit: true
    })
}

const listAuctions = async (ctx, button = false) => {
    invalidateAuctionPages(ctx)

    let filterQuery = {ended: false, cancelled: false}

    if (ctx.options?.me) {
        filterQuery.userID = ctx.user.userID
    } else if (!ctx.options.me && ctx.options.me !== undefined) {
        filterQuery.userID = { $ne: ctx.user.userID }
    }

    if (ctx.options.bid) {
        filterQuery.lastBidderID = ctx.user.userID
    } else if (!ctx.options.bid && ctx.options.bid !== undefined) {
        filterQuery.lastBidderID = { $ne: ctx.user.userID }
    }

    if (ctx.options?.card_query) {
        filterQuery.cardID = { $in: ctx.globalCards.map(x => x.cardID) }
    }

    let sort = {expires: 1}

    if (ctx.args?.sortStyle) {
        switch (ctx.args.sortStyle) {
            case 'time_asc':
                break;
            case 'time_desc':
                sort = {expires: -1}
                break;
            case 'price_asc':
                sort = {price: 1}
                break;
            case 'price_desc':
                sort = {price: -1}
                break;
        }
    }

    let activeAuctions = await Auctions.find(filterQuery).sort(sort).lean()
    if (activeAuctions.length === 0) {
        return ctx.send(ctx, `No auctions found matching your query or other options!`, 'red')
    }

    const uniqueID = generateNewID()
    const buttonID = uniqueID.replaceAll(/-/g, "O")

    const pages = ctx.getPages(listAuctionEmbedRows(ctx, activeAuctions))

    const customPgnButtons = []
    if (pages.length > 1) {
        const total = pages.length
        customPgnButtons.push(new Button(`auction_list-${buttonID}-first`).setStyle(1).setLabel('First'))
        customPgnButtons.push(new Button(`auction_list-${buttonID}-${total - 1}`).setStyle(1).setLabel('Back'))
        customPgnButtons.push(new Button(`auction_list-${buttonID}-1`).setStyle(1).setLabel('Next'))
        customPgnButtons.push(new Button(`auction_list-${buttonID}-last`).setStyle(1).setLabel('Last'))
    }

    const customButtons = [new Button(`auction_info-${buttonID}-0`).setStyle(2).setLabel('Show Info')]

    const message = await ctx.send(ctx, {
        pages,
        embed: {
            title: `Found ${ctx.fmtNum(activeAuctions.length)} auctions`,
            description: `${activeAuctions.length} auctions`,
            color: ctx.colors.blue
        },
        customButtons,
        customPgnButtons,
        parent: button
    })

    auctionPages.push({
        uniqueID,
        buttonID,
        userID: ctx.user.userID,
        lastListPage: 0,
        lastInfoIndex: 0,
        lastUsed: new Date(),
        messageID: message?.message?.id || message.resource.message.id, //Using the list view from the button returns a different message response than normal
        findArgs: {
            cardIDs: filterQuery.cardID?.$in,
            me: ctx.options?.me? true: ctx.options.me === undefined? undefined: false,
            bid: ctx.options?.bid? true: ctx.options.bid === undefined? undefined: false,
            sort
        }
    })
}

const listAuctionPage = async (ctx) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }

    const filterQuery = { ended: false }
    if (entry.findArgs.cardIDs) {
        filterQuery.cardID = { $in: entry.findArgs.cardIDs }
    }

    if (entry.findArgs.me !== undefined) {
        filterQuery.userID = entry.findArgs.me? entry.userID: { $ne: entry.userID }
    }

    if (entry.findArgs.bid !== undefined) {
        filterQuery.lastBidderID = entry.findArgs.bid? entry.userID: { $ne: entry.userID }
    }

    const auctions = await Auctions.find(filterQuery).sort(entry.findArgs.sort)

    if (!auctions.length) {
        auctionPages = auctionPages.filter(x => x.uniqueID !== entry.uniqueID)
        return ctx.send(ctx, {
            embed: {
                description: `No auctions found matching your queries, they may have expired or been cancelled!`,
                color: ctx.colors.red
            },
            parent: true
        })
    }

    entry.lastUsed = new Date()

    const pages = ctx.getPages(listAuctionEmbedRows(ctx, auctions))
    const total = pages.length

    const pageNum = ctx.arguments[1]
    let page = pageNum === 'first'? 0: pageNum === 'last'? total - 1: Number(pageNum)
    if (Number.isNaN(page) || page >= total) {
        page = 0
    }
    if (page < 0) {
        page = total - 1
    }

    entry.lastListPage = page
    const customPgnButtons = []
    const customButtons = []
    if (pages.length > 1) {
        const nextPage = page + 1 >= total? 0: page + 1
        const backPage = page - 1 < 0? total - 1 : page - 1
        customPgnButtons.push(new Button(`auction_list-${entry.buttonID}-first`).setStyle(1).setLabel('First'))
        customPgnButtons.push(new Button(`auction_list-${entry.buttonID}-${backPage}`).setStyle(1).setLabel('Back'))
        customPgnButtons.push(new Button(`auction_list-${entry.buttonID}-${nextPage}`).setStyle(1).setLabel('Next'))
        customPgnButtons.push(new Button(`auction_list-${entry.buttonID}-last`).setStyle(1).setLabel('Last'))
    }
    customButtons.push(new Button(`auction_info-${entry.buttonID}-${page * 10}`).setStyle(2).setLabel('Show Info'))

    let displayPages = [...pages]
    if (page !== -1) {
        const [removedItem] = displayPages.splice(page, 1)
        displayPages.unshift(removedItem)
    }

    return ctx.send(ctx, {
        pages: displayPages,
        embed: {
            title: `Found ${ctx.fmtNum(auctions.length)} auctions`,
            description: `${auctions.length} auctions`,
            color: ctx.colors.blue,
            footer: { text: `Page ${page + 1}/${total}` },
        },
        parent: true,
        customPgnButtons,
        customButtons,
    })
}

const listAuctionInfo = async (ctx, forcedPage) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }

    const filterQuery = { ended: false }
    if (entry.findArgs.cardIDs) {
        filterQuery.cardID = { $in: entry.findArgs.cardIDs }
    }

    if (entry.findArgs.me !== undefined) {
        filterQuery.userID = entry.findArgs.me? entry.userID: { $ne: entry.userID }
    }

    if (entry.findArgs.bid !== undefined) {
        filterQuery.lastBidderID = entry.findArgs.bid? entry.userID: { $ne: entry.userID }
    }

    const auctions = await Auctions.find(filterQuery).sort(entry.findArgs.sort)
    if (!auctions.length) {
        auctionPages = auctionPages.filter(x => x.uniqueID !== entry.uniqueID)
        return ctx.send(ctx, {
            embed: {
                description: `No auctions found matching your queries, they may have expired or been cancelled!`,
                color: ctx.colors.red
            },
            parent: true
        })
    }

    entry.lastUsed = new Date()

    const total = auctions.length

    const pageNum = forcedPage || ctx.arguments[1]
    let page = pageNum === 'first'? 0: pageNum === 'last'? total - 1: Number(pageNum)
    if (Number.isNaN(page) || page >= total) {
        page = 0
    }
    if (page < 0) {
        page = total - 1
    }

    entry.lastInfoIndex = page
    const viewedAuction = auctions[page]
    entry.currentEncodedUUID = encodeUUID(viewedAuction.auctionID)

    const embed = await createAuctionInfoEmbed(ctx, viewedAuction, {total, page})

    const customPgnButtons = []
    const customButtons = []
    if (total > 1) {
        const nextPage = page + 1 >= total? 0: page + 1
        const backPage = page - 1 < 0? total - 1 : page - 1
        customButtons.push(new Button(`auction_info-${entry.buttonID}-first`).setStyle(1).setLabel('First'))
        customButtons.push(new Button(`auction_info-${entry.buttonID}-${backPage}`).setStyle(1).setLabel('Back'))
        customButtons.push(new Button(`auction_info-${entry.buttonID}-${nextPage}`).setStyle(1).setLabel('Next'))
        customButtons.push(new Button(`auction_info-${entry.buttonID}-last`).setStyle(1).setLabel('Last'))
        customButtons.push(false)
    }
    customButtons.push(new Button(`auction_list-${entry.buttonID}-${entry.lastListPage}`).setStyle(2).setLabel('Show List'))

    if (ctx.user.userID === viewedAuction.userID) {
        customButtons.push(new Button(`auction_cancel-${entry.buttonID}-${page}`).setLabel('Cancel Auction').setStyle(4).setOff(viewedAuction.ended || viewedAuction.cancelled || viewedAuction.lastBidderID !== undefined || (new Date() - new Date(viewedAuction.time).getTime()) > 1000 * 60 * 5))
    } else {
        const bids = !viewedAuction.bids.length? 0: viewedAuction.bids.filter(x => x.userID === ctx.user.userID).length
        const bidButton = new Button(`auction_bid_modal-${entry.buttonID}-${page}`).setLabel(bids >= 5? `Bid Limit Reached`: `Place Bid (${5 - bids} left)`).setStyle(bids >= 5? 4: 3).setOff(bids >= 5)
        customButtons.push(bidButton)
        if (viewedAuction.lastBidderID === ctx.user.userID) {
            customButtons.push(new Button(`auction_view_bid-${entry.buttonID}-${page}`).setLabel('View My Bid').setStyle(2))
        }
    }

    return ctx.send(ctx, {
        embed,
        parent: true,
        customPgnButtons,
        customButtons,
    })
}

const auctionBid = async (ctx) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }
    const raw = ctx.options.bidAmount?.trim() ?? ''
    if (!/^\d+$/.test(raw)) {
        return ctx.send(ctx, `Invalid bid amount. Enter a positive number with no symbols, commas, or suffixes.`, 'red')
    }
    const bidAmount = Number(raw)
    if (!Number.isSafeInteger(bidAmount) || bidAmount <= 0) {
        return ctx.send(ctx, `Bid amount must be positive!`, 'red')
    }
    const auction = await Auctions.findOne({ ended: false, auctionID: decodeUUID(entry.currentEncodedUUID) })
    if (!auction) {
        return ctx.send(ctx, `The auction has ended or is no longer available!`, 'red')
    }
    let error
    if (bidAmount <= auction.price) {
        error = `You need to bid more than ${ctx.boldName(ctx.fmtNum(auction.price))}${ctx.symbols.tomato} on this auction!`
    }

    if (bidAmount > ctx.user.tomatoes) {
        error = `You don't have enough tomatoes to bid ${ctx.boldName(ctx.fmtNum(bidAmount))}${ctx.symbols.tomato}, you only have ${ctx.boldName(ctx.fmtNum(ctx.user.tomatoes))}${ctx.symbols.tomato}!`
    }

    if (auction.lastBidderID === ctx.user.userID && bidAmount <= auction.highBid) {
        await ctx.interaction.defer(64)
        return ctx.send(ctx, `You have already bid ${ctx.boldName(ctx.fmtNum(auction.highBid))}${ctx.symbols.tomato} on this auction! Bid more to raise your bid.`, 'red')
    }

    if (bidAmount <= auction.highBid) {
        error = `You have tried to bid ${ctx.boldName(ctx.fmtNum(bidAmount))}${ctx.symbols.tomato} on this auction, but someone else has already has a hidden bid that's higher! Try a higher amount, and remember there are only 5 bids per auction!`
        auction.price = bidAmount > auction.price? bidAmount: auction.price
        auction.bids.push({ userID: ctx.user.userID, amount: bidAmount, time: new Date(), success: false})
        await auction.save()
    }

    if (error) {
        await ctx.interaction.defer(64)
        return ctx.send(ctx, error, 'red')
    }

    if (auction.lastBidderID === ctx.user.userID) {
        let priceDifference = bidAmount - auction.highBid
        ctx.user.tomatoes -= priceDifference
        await ctx.user.save()
        auction.highBid = bidAmount
        auction.bids.push({ userID: ctx.user.userID, amount: bidAmount, time: new Date(), success: true})
        await auction.save()
        await listAuctionInfo(ctx, entry.lastInfoIndex)
        return await ctx.send(ctx, `You have successfully increased your bid on this auction! Use the \`View My Bid\` button to see your new bid!`, 'green')
    } else {
        if (auction.lastBidderID) {
            let lastBidder = await fetchUser(auction.lastBidderID)
            lastBidder.tomatoes += auction.highBid
            await lastBidder.save()
            if (lastBidder.preferences.notify.aucOutbid) {
                try {
                    await ctx.sendDM(ctx, lastBidder, `Someone has outbid you on the auction for ${ctx.formatName(ctx, ctx.cards[auction.cardID])}!`, ctx.colors.red)
                } catch (e) {
                    console.log(e)
                }
            }
        }
        auction.price = auction.highBid
        auction.lastBidderID = ctx.user.userID
        auction.highBid = bidAmount
        auction.bids.push({ userID: ctx.user.userID, amount: bidAmount, time: new Date(), success: true})
        await auction.save()
        ctx.user.tomatoes -= bidAmount
        await ctx.user.save()
        await listAuctionInfo(ctx, entry.lastInfoIndex)
        return await ctx.send(ctx, `You have successfully bid on this auction! Use the \`View My Bid\` button to see your bid!`, 'green')
    }

}

const auctionBidModal = async (ctx) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }
    const viewedAuction = await Auctions.findOne({auctionID: decodeUUID(entry.currentEncodedUUID)})
    if (!viewedAuction) {
        return ctx.send(ctx, `The auction you are trying to bid on is no longer available!`, 'red')
    }
    return ctx.interaction.createModal({
        customID: `auction_bid-${entry.buttonID}-${entry.currentEncodedUUID}`,
        title: `Place a bid`,
        components: [{
            type: 1,
            components: [{
                type: 4,
                customID: 'bidAmount',
                label: `Bid Amount (must be higher than ${ctx.fmtNum(viewedAuction.price)}${ctx.symbols.tomato})`,
                style: 1,
                placeholder: 'Enter your bid amount',
                required: true
            }]
        }]
    })
}

const auctionViewBidResponse = async (ctx) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }
    const auction = await Auctions.findOne({auctionID: decodeUUID(entry.currentEncodedUUID)})
    if (auction.lastBidderID !== ctx.user.userID) {
        return ctx.send(ctx, `You are currently not the highest bidder and therefore cannot see the high bid any longer!`, 'red')
    }
    return ctx.send(ctx, `You have bid ${ctx.boldName(ctx.fmtNum(auction.highBid))}${ctx.symbols.tomato} on this auction!`, 'green')
}

const auctionCancel = async (ctx) => {
    const entry = getActivePages(ctx)
    if (!entry) {
        return removeAuctionButtons(ctx)
    }
    const auctionToCancel = await Auctions.findOne({auctionID: decodeUUID(entry.currentEncodedUUID)})
    if (!auctionToCancel) {
        return ctx.send(ctx, `The auction you are trying to cancel is no longer available!`, 'red')
    }
    if (auctionToCancel.cancelled) {
        return ctx.send(ctx, `This auction has already been cancelled!`, 'red')
    }
    if (auctionToCancel.ended) {
        return ctx.send(ctx, `This auction has already ended!`, 'red')
    }
    if (auctionToCancel.lastBidderID) {
        return ctx.send(ctx, `You cannot cancel an auction that has already been bid on!`, 'red')
    }
    if (new Date() - new Date(auctionToCancel.time).getTime() > 1000 * 60 * 5) {
        return ctx.send(ctx, `This auction has been active for more than 5 minutes and cannot be cancelled!`, 'red')
    }
    auctionToCancel.cancelled = true
    auctionToCancel.ended = true
    await auctionToCancel.save()
    await addUserCards(auctionToCancel.userID, [auctionToCancel.cardID])
    await listAuctionInfo(ctx, entry.lastInfoIndex)
    return ctx.send(ctx, `You have successfully cancelled this auction and your card has been returned to you!`, 'green')

}

const auctionConfirm = async (ctx) => {
    let many = ctx.arguments.pop()
    const pendingAuction = await AuctionQueue.findOne({
        userID: ctx.arguments.pop(),
        messageID: ctx.arguments.pop()
    })
    if (!pendingAuction) {
        return ctx.send(ctx, {
            embed: {
                title: ``,
                description: `The auction listing you were attempting to confirm cannot be found and has been cancelled. Please try again, if you are seeing this message consistently please contact us in our support discord.`,
                color: ctx.colors.red
            },
            parent: true
        })
    }
    let cost = Number(ctx.arguments.pop())
    if (cost > ctx.user.tomatoes) {
        await AuctionQueue.findOneAndDelete(pendingAuction)
        return ctx.send(ctx, {
            embed: {
                title: ``,
                description: `Between sending the command and confirming the listing you no longer have enough tomatoes to confirm this auction listing. Please try your listing again when you have enough!`,
                color: ctx.colors.red
            },
            parent: true
        })
    }
    let cards = [...new Set(pendingAuction.cardIDs)]
    let count = []
    cards.forEach(cardID => {
        let amount = 0
        pendingAuction.cardIDs.forEach(x => x === cardID? amount++: x)
        count.push({cardID: cardID, count: amount})
    })
    let ownedCards = [...ctx.userCards]
    let errored = false
    for (let card of count) {
        if (!ownedCards.some(x => x.cardID === card.cardID && x.fav? x.amount - card.count >= 1: x.amount >= card.count)) {
            errored = true
        }
    }
    if (errored) {
        await AuctionQueue.findOneAndDelete(pendingAuction)
        return ctx.send(ctx, {
            embed: {
                title: ``,
                description: `Between sending the command and confirming the listing you no longer have the required cards to confirm this auction listing. Please try your listing again!`,
                color: ctx.colors.red
            },
            parent: true
        })
    }
    ctx.user.tomatoes -= cost
    await ctx.updateStat(ctx, 'tomatoOut', cost)
    await ctx.user.save()
    pendingAuction.paid = true
    await pendingAuction.save()
    await removeUserCards(ctx.user.userID, pendingAuction.cardIDs, 1)
    const pages = pendingAuction.cardIDs.map(x => ctx.formatName(ctx, ctx.cards[x]))
    const viewAucButton = new Button('auction_success_view').setLabel('View Auctions').setStyle(2)
    return ctx.send(ctx, {
        pages: ctx.getPages(pages),
        embed: {
            title: `You have auctioned ${many? `${pendingAuction.cardIDs.length} cards`: `${pendingAuction.cardIDs.length > 1? `${pendingAuction.cardIDs.length} copies of `: ``}1 card`} and spent ${ctx.fmtNum(cost)}${ctx.symbols.tomato}`,
        },
        customButtons: [viewAucButton],
        parent: true
    })
}

const auctionDecline = async (ctx) => {
    ctx.arguments.pop()
    const pendingAuction = await AuctionQueue.findOneAndDelete({
        userID: ctx.arguments.pop(),
        messageID: ctx.arguments.pop()
    })
    if (pendingAuction) {
        let cards = [...new Set(pendingAuction.cardIDs)]
        await ctx.send(ctx, {
            embed: {
                title: ``,
                description: `You have cancelled listing ${ctx.boldName(ctx.fmtNum(pendingAuction.cardIDs.length))}x ${cards.length > 1? `${ctx.boldName(ctx.fmtNum(cards.length))} cards`: ctx.formatName(ctx, ctx.cards[cards[0]])} on auction. No tomatoes or cards have been removed from your account.`,
                color: ctx.colors.red
            },
            parent: true
        })
    } else {
        await ctx.send(ctx, {
            embed: {
                title: ``,
                description: 'The auction listing tied to this message cannot be found, it may have already been cancelled. If this problem persists please contact us in our support discord.',
                color: ctx.colors.red
            },
            parent: true
        })
    }
}

const invalidateAuctionPages = (ctx) => {
    auctionPages = auctionPages.filter(x => x.userID !== ctx.user.userID)
}

const timeoutAuctionPages = () => setInterval(() => {
    const now = new Date().getTime()
    auctionPages = auctionPages.filter(x => (1000 * 60 * 5 + new Date(x.lastUsed).getTime()) >= now)
}, 60000)

const removeAuctionButtons = async (ctx) => {
    await ctx.send(ctx, {
        embed: ctx.interaction.message.embeds[0],
        parent: true
    })
    return ctx.interaction.channel.createMessage({
        embeds: [
            {
                description: `The auction list you have attempted to interact with has expired. They expire after 5 minutes of inactivity or after a bot restart/secondary command. Please run the command again!`,
                color: ctx.colors.red
            }
        ],
        messageReference: {messageID: ctx.interaction.message.id}
    })
}

const getActivePages = (ctx) => {
    let index = auctionPages.findIndex(x => ctx.arguments[0].replaceAll(/O/g, "-") === x.uniqueID)
    if (index < 0) {
        return false
    }
    return auctionPages[index]
}

timeoutAuctionPages()