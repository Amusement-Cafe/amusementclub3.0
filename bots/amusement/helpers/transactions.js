const Transaction = require('../../../db/transaction')
const {
    generateNewID
} = require("../../../utils/misc")

const {
    fetchUser,
} = require("./user")

const {
    addUserCards,
    removeUserCards, getUserCards,
} = require("./userCard")

const createTransaction = async (ctx, cardIDs, toID = 'bot', cost) => {
    if (toID !== 'bot' || !toID) {
        toID = toID.userID
    }

    let trans = new Transaction()
    trans.transactionID = generateNewID()
    trans.fromID = ctx.user.userID
    trans.toID = toID
    trans.status = 'pending'
    trans.guildID = ctx.isGuildDM(ctx)? ctx.guild: ctx.guild.guildID
    trans.cost = cost
    trans.cardIDs = cardIDs
    trans.dateCreated = new Date()
    await trans.save()

    return {success: true, transactionID: trans.transactionID }
}

const completeTransaction = async (ctx, decline = false, parent = true, extra = false) => {
    ctx.arguments = ctx.arguments[0].replaceAll(/O/g, "-")
    const transaction = await Transaction.findOne({transactionID: ctx.arguments, status: 'pending'})

    if (!transaction) {
        return ctx.send(ctx, {
            embed: {
                description: `Transaction cannot be found or it is already completed!`,
                color: ctx.colors.red
            },
            parent
        })
    }

    if (ctx.user.userID !== transaction.fromID && ctx.user.userID !== transaction.toID && !ctx.user.roles.some(x => x === 'admin' || x === 'mod' || x === 'auditor')) {
        await ctx.interaction.defer(64)
        return ctx.interaction.createFollowup({
            embeds: [{
                description: `${ctx.user.username}, you cannot interact with another user's transaction!`,
                color: ctx.colors.red
            }]
        })
    }

    extra? await ctx.interaction.defer(64): null

    if (decline) {
        transaction.status = 'declined'
        await transaction.save()
        if (ctx.user.userID !== transaction.fromID) {
            return ctx.send(ctx, {
                embed: {
                    description: `The transaction from <@${transaction.fromID}> has been declined.`,
                    color: ctx.colors.red
                },
                parent: !extra
            })
        }
        return ctx.send(ctx, {
            embed: {
                description: `The transaction to ${transaction.toID === 'bot'? 'bot': `<@${transaction.toID}>`} has been declined.`,
                color: ctx.colors.red
            },
            parent: !extra
        })
    }

    if (ctx.user.userID !== transaction.toID && transaction.toID !== 'bot') {
        extra? null: await ctx.interaction.defer(64)
        return ctx.interaction.createFollowup({
            embeds: [{
                description: `${ctx.user.username}, you cannot accept a sale for another user!`,
                color: ctx.colors.red
            }]
        })
    }

    let toUser = await fetchUser(transaction.toID)
    let fromUser = await fetchUser(transaction.fromID)

    if (toUser && toUser.tomatoes < transaction.cost) {
        return ctx.send(ctx, {
            embed: {
                description: `You don't have enough tomatoes to accept this transaction!\nYou need **${ctx.fmtNum(transaction.cost - ctx.user.tomatoes)}**${ctx.symbols.tomato} more tomatoes to accept this transaction.`,
                color: ctx.colors.red
            },
            parent: !extra
        })
    }

    const fromCards = await getUserCards(ctx, fromUser.userID)
    if (!fromCards.some(x => transaction.cardIDs.includes(x.cardID))) {
        return ctx.send(ctx, {
            embed: {
                description: `You don't have enough tomatoes to accept this transaction!\nYou need **${ctx.fmtNum(transaction.cost - ctx.user.tomatoes)}**${ctx.symbols.tomato} more tomatoes to accept this transaction.`,
                color: ctx.colors.red
            },
            parent: !extra
        })
    }
    let toName = 'bot'

    if (toUser) {
        toUser.tomatoes -= transaction.cost
        await addUserCards(toUser.userID, transaction.cardIDs)
        await toUser.save()
        toName = toUser.username
    }

    fromUser.tomatoes += transaction.cost
    await removeUserCards(fromUser.userID, transaction.cardIDs)
    await fromUser.save()

    transaction.status = 'confirmed'
    await transaction.save()

    return ctx.send(ctx, {
        embed: {
            description: `${ctx.boldName(fromUser.username)} sold ${ctx.boldName(transaction.cardIDs.length)} card(s) to ${ctx.boldName(toName)} for ${ctx.boldName(ctx.fmtNum(transaction.cost))}${ctx.symbols.tomato}`,
            color: ctx.colors.green
        },
        parent: !extra
    })

}

const getUserTransactions = async (ctx, lean = true, otherID = false) => lean? Transaction.find({$or: [{fromID: otherID? otherID: ctx.user.userID}, {toID: otherID? otherID: ctx.user.userID}]}).lean(): Transaction.find({$or: [{fromID: otherID? otherID: ctx.user.userID}, {toID: otherID? otherID: ctx.user.userID}]})

const formatTransactions = async (ctx, transaction) => {
    let from = transaction.fromID === ctx.user.userID
    const symbol = transaction.status === 'confirmed'? ctx.symbols.accept: transaction.status === 'pending'? ctx.symbols.pending: transaction.status === 'auction'? ctx.symbols.auctionTrans: ctx.symbols.decline
    const cardDisplay = transaction.cardIDs.length > 1? `${ctx.fmtNum(transaction.cardIDs.length)} cards`: ctx.formatName(ctx, ctx.cards[transaction.cardIDs[0]])
    const otherUser = await fetchUser(from? transaction.toID: transaction.fromID)
    return `[~${ctx.timeDisplay(ctx, transaction.dateCreated)}] ${symbol} ${cardDisplay} ${from? '`->`': '`<-`'} **${otherUser? otherUser.username: 'BOT'}**`
}
const formatTransactionInfo = async (ctx, transaction, index, length) => {
    const fromUser = await fetchUser(transaction.fromID)
    const toUser = await fetchUser(transaction.toID)
    const symbol = transaction.status === 'confirmed'? ctx.symbols.accept: transaction.status === 'pending'? ctx.symbols.pending: transaction.status === 'auction'? ctx.symbols.auctionTrans: ctx.symbols.decline
    let guild = await ctx.bot.guilds.get(transaction.guildID)
    let guildName = guild? guild.name: 'DMs or Deleted Server'
    const embed = {}
    embed.title = `Transaction [${transaction.transactionID}] (${ctx.timeDisplay(ctx, transaction.dateCreated)})`
    embed.description = `Cards: ${ctx.boldName(transaction.cardIDs.length)}
    Price: ${ctx.boldName(ctx.fmtNum(transaction.cost))}
    From: ${fromUser.username}
    To: ${ctx.boldName(toUser.username || 'BOT')}
    On server: ${ctx.boldName(guildName)}
    Status: ${symbol}${transaction.status}
    Date: <t:${Math.floor(new Date(transaction.dateCreated).getTime() / 1000)}:F>`.replace(/\s\s+/gm, '\n')
    embed.fields = []
    embed.fields.push({
        name: `Cards`,
        value: transaction.cardIDs.map(x => ctx.formatName(ctx, ctx.cards[x])).slice(0, 10)[0]
    })
    embed.color = ctx.colors.blue
    embed.footer = {text: `Page ${index + 1}/${length}`}
    return embed
}

module.exports = {
    createTransaction,
    completeTransaction,
    getUserTransactions,
    formatTransactions,
    formatTransactionInfo,
}