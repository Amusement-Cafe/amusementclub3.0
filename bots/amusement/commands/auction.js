const {generateGlobalCommand} = require("../../../utils/commandGeneration")
const Auctions = require("../../../db/auction")
const AuctionQueue = require("../../../db/auctionQueue")

const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    removeUserCards,
} = require("../helpers/userCard")

const {
    Button
} = require("../helpers/componentBuilders")


registerBotCommand(['auction', 'sell', 'one'], async (ctx) => await auctionSell(ctx))
registerBotCommand(['auction', 'sell', 'many'], async (ctx) => await auctionSell(ctx, true))
registerBotCommand(['auction', 'list'], async (ctx) => await listAuctions(ctx))

registerReaction(['auction', 'cfm'], async (ctx) => {})
registerReaction(['auction', 'dcl'], async (ctx) => {})

generateGlobalCommand('auction', 'Top Level Auction')
    .subCommand('list', 'List current active auctions')
    .cardQuery()
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
    console.log(msg)
    const newAucQueue = new AuctionQueue()
    newAucQueue.userID = ctx.user.userID
    newAucQueue.guildID = ctx.guild.guildID
    newAucQueue.channelID = ctx.interaction.channel.channelID
    newAucQueue.messageID = msg.message.id
    newAucQueue.cardIDs = queuePrep
    newAucQueue.timeLength = length
    newAucQueue.listPrice = price
    newAucQueue.limit = limit
    await newAucQueue.save()

    const pages = queuePrep.map(x => ctx.formatName(ctx, ctx.cards[x]))
    if (ctx.user.preferences.interact.alwaysForce) {
        // ctx.user.tomatoes -= cost
        await ctx.updateStat(ctx, 'tomatoOut', cost)
        // await ctx.user.save()
        newAucQueue.paid = true
        await newAucQueue.save()
        // await removeUserCards(ctx.user.userID, queuePrep, 1)
        return ctx.send(ctx, {
            pages: ctx.getPages(pages),
            embed: {
                title: `You have auctioned ${many? `${auctionCards.length} cards`: `${limit > 1? `${limit} copies of `: ``}1 card`} and spent ${ctx.fmtNum(cost)}${ctx.symbols.tomato}`
            },
            edit: true
        })
    }
    const cfmButton = new Button(`auction_cfm-${cost}-${msg.messageID}-${ctx.user.userID}`).setLabel('Confirm').setStyle(3)
    const dclButton = new Button(`auction_dcl-${cost}-${msg.messageID}-${ctx.user.userID}`).setLabel('Decline').setStyle(4)
    return ctx.send(ctx, {
        pages: ctx.getPages(pages),
        embed: {
            title: `You are about to auction ${many? `${auctionCards.length} cards`: `${limit > 1? `${limit} copies of `: ``}1 card`}\nThis will cost you ${cost}${ctx.symbols.tomato} to list`,

        },
        customButtons: [cfmButton, dclButton],
        edit: true
    })
}

const listAuctions = async (ctx) => {
    const activeAuctions = await Auctions.find({ended: false})
    console.log(activeAuctions)
    return ctx.send(ctx, `${activeAuctions.length} auctions`)
}

const auctionBid = async (ctx) => {}

const auctionCancel = async (ctx) => {}

const auctionInfo = async (ctx) => {}

const auctionPreview = async (ctx) => {}