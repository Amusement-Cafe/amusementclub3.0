const {registerBotCommand} = require('../../../utils/commandRegistrar')

const {
    createTransaction,
    completeTransaction,
    listTransactions,
} = require('../helpers/transactions')

const {
    fetchUser
} = require("../helpers/user")


registerBotCommand(['sell', 'one'], async (ctx) => await sell(ctx), { withCards: true })

registerBotCommand(['sell', 'many'], async (ctx) => await sell(ctx, true))

registerBotCommand(['transaction', 'confirm'], async (ctx) => await finalizeTransaction(ctx))

registerBotCommand(['transaction', 'decline'], async (ctx) => await finalizeTransaction(ctx, false))

registerBotCommand(['transaction', 'list'], async (ctx) => await listTransaction(ctx))

registerBotCommand(['transaction', 'info'], async (ctx) => await transactionInfo(ctx))

const sell = async (ctx, many = false) => {
    let saleCards, toUser, amountDisplay

    if (!many) {
        saleCards = ctx.userCards[0]? [ctx.userCards[0]]: false
    } else {
        saleCards = ctx.userCards
    }

    if (ctx.args.userIDs[0]) {
        toUser = await fetchUser(ctx.args.userIDs[0])
        if (!toUser) {
            return ctx.send(ctx, `The user you have entered <@${ctx.args.userIDs[0]}> does not have a bot account to setup a sale to! Have them start playing before trying again.`, 'red')
        }

        if (toUser.userID === ctx.user.userID) {
            return ctx.send(ctx, `You cannot setup sales to yourself!`, 'red')
        }

        if (!toUser.preferences.interact.canSell) {
            return ctx.send(ctx, `The user you are trying to sell to has disabled the ability to sell them cards!`, 'red')
        }
    }

    if (!saleCards || saleCards.length === 0) {
        return ctx.send(ctx, `no cards found for query \`${ctx.options.card_query}\`, please check your spelling and try again!`, 'red')
    }

    if (ctx.options.amount && !many) {
        if (saleCards.fav && saleCards.amount === ctx.options.amount) {
            return ctx.send(ctx, `You are trying to sell as many copies as you own, but this card is favorited! Reduce your sale amount by 1 or remove the card from your favorites before re-running this command.`, 'red')
        }

        if (saleCards.amount < ctx.options.amount) {
            return ctx.send(ctx, `You cannot sell more copies than you own!`, 'red')
        }

        amountDisplay = ctx.options.amount
    }

    saleCards = saleCards.filter(x => x.fav? x.amount > 1: x.amount >= 1)

    if (saleCards.length === 0) {
        return ctx.send(ctx, `All cards in your query are favorited and only have one copy! Please re-run your command to include more non-favorite cards or remove the cards from your favorites first!`, 'red')
    }

    if (!ctx.args.cardQuery.locked) {
        saleCards = saleCards.filter(x => !x.locked)
    }

    if (saleCards.length === 0) {
        return ctx.send(ctx, `Are you sure you want to sell this card?\nThe card you have chosen is locked and cannot be sold unless you use the \`-locked\` query in your card query!`, 'red')
    }

    let cost = saleCards.reduce((a, b) => a + (b.eval), 0)

    if (ctx.options.amount && !many) {
        cost = cost * ctx.options.amount
    }

    if (ctx.options.amount && many) {
        saleCards = saleCards.slice(0, ctx.options.amount < saleCards.length? ctx.options.amount : saleCards.length)
    }

    if (!toUser) {
        cost = Math.round(cost * .75)
    }

    const transaction = await createTransaction(ctx, saleCards.map(x => x.cardID), toUser, cost)

    if (!transaction.success) {
        return ctx.send(ctx, transaction.error, 'red')
    }

    ctx.args.fmtOptions.amount = false

    cost = `${ctx.fmtNum(cost)}${ctx.symbols.tomato}`

    let title = toUser? `${toUser.username}, ${ctx.user.username} wants to sell you ${amountDisplay? amountDisplay: saleCards.length} cards for ${cost}`: `${ctx.user.username}, you are trying to sell ${amountDisplay? amountDisplay: saleCards.length} card(s) to the bot for ${cost}`

    let perms = {pages: [ctx.user.userID], cfm: [ctx.user.userID], dcl: [ctx.user.userID]}

    if (toUser) {
        perms.pages.push(toUser.userID)
        perms.cfm = [toUser.userID]
        perms.dcl.push(toUser.userID)
    }

    return ctx.send(ctx, {
        pages: ctx.getPages(saleCards.map((card) => `${ctx.formatName(ctx, card)}${amountDisplay? ` (x${amountDisplay})`: ``}`)),
        embed: {
            title: title,
            color: ctx.colors.yellow,
        },
        permissions: perms,
        customButtons: [
            { type: 2, label: `Confirm`, style: 3, customID: `trans_cfm-${transaction.transactionID.replaceAll(/-/g, "O")}`},
            { type: 2, label: 'Decline', style: 4, customID: `trans_dcl-${transaction.transactionID.replaceAll(/-/g, "O")}`}
        ]
    })
}

const finalizeTransaction = async (ctx, confirm = true) => {}

const listTransaction = async (ctx) => {}

const transactionInfo = async (ctx) => {}