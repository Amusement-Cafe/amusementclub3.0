const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    createTransaction,
    completeTransaction,
    formatTransactions,
    getUserTransactions,
    formatTransactionInfo,
} = require('../helpers/transactions')

const {
    fetchUser
} = require("../helpers/user")
const {Button} = require("../helpers/componentBuilders");

let transactionPages = []

registerBotCommand(['sell', 'one'], async (ctx) => await sell(ctx), { withCards: true })

registerBotCommand(['sell', 'many'], async (ctx) => await sell(ctx, true))

registerBotCommand(['transactions'], async (ctx) => await listTransaction(ctx))

registerReaction(['trans', 'cfm'], async (ctx) => await completeTransaction(ctx))
registerReaction(['trans', 'dcl'], async (ctx) => await completeTransaction(ctx, true))

registerReaction(['trans', 'list'], async (ctx) => await listTransactionPage(ctx))
registerReaction(['trans', 'custom'], async (ctx) => await listTransactionCustomPage(ctx))
registerReaction(['trans', 'modal'], async (ctx) => await listTransactionModal(ctx))

registerReaction(['trans', 'info'], async (ctx) => await showTransactionInfo(ctx))
registerReaction(['trans', 'info', 'custom'], async (ctx) => await showCustomTransactionInfo(ctx))
registerReaction(['trans', 'info', 'modal'], async (ctx) => await showCustomTransactionInfoModal(ctx))


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

const listTransaction = async (ctx) => {
    timeoutTransactionPages(ctx)
    filterDuplicatePages(ctx)
    let userTransactions = await getUserTransactions(ctx)
    let pageArray = []
    if (ctx.args?.auctions !== undefined) {
        let operator = (x) => ctx.args.auctions? x.status === 'auction': x.status !== 'auction'
        userTransactions = userTransactions.filter(x => operator(x))
    }
    if (ctx.args?.received !== undefined) {
        let operator = (x) => ctx.args.received? x.toID === ctx.user.userID: x.toID !== ctx.user.userID
        userTransactions = userTransactions.filter(x => operator(x))
    }
    if (ctx.args?.pending !== undefined) {
        let operator = (x) => ctx.args.pending? x.status === 'pending': x.status !== 'pending'
        userTransactions = userTransactions.filter(x => operator(x))
    }
    if (ctx.options?.card_query) {
        let globalIDs = ctx.globalCards.map(x => x.cardID)
        let operator = (x) => x.cardIDs.some(y => globalIDs.includes(y))
        userTransactions = userTransactions.filter(x => operator(x))
    }
    if (userTransactions.length === 0) {
        return ctx.send(ctx, `There are no transactions to list with your query!`, 'red')
    }
    userTransactions.sort((a, b) => b.dateCreated - a.dateCreated)
    await Promise.all(userTransactions.map(async (x, i) => {
        pageArray[i] = await formatTransactions(ctx, x)
    }))

    const customPgnButtons = []
    const pages = ctx.getPages(pageArray)

    if (pages.length > 1) {
        customPgnButtons.push(new Button(`trans_list-${ctx.user.userID}-last`).setStyle(1).setLabel('Back'))
        customPgnButtons.push(new Button(`trans_list-${ctx.user.userID}-1`).setStyle(1).setLabel('Next'))
    }
    if (pages.length >= 15) {
        customPgnButtons.push(new Button(`trans_modal-${ctx.user.userID}`).setStyle(2).setLabel('Jump To...'))
    }

    const customButtons = []
    customButtons.push(new Button(`trans_info-${ctx.user.userID}-0`).setStyle(2).setLabel('Show Info'))

    const msg = await ctx.send(ctx, {
        pages,
        embed: {
            title: `${ctx.user.username}, your transactions (${userTransactions.length} results)`,
            description: `${userTransactions.length}`
        },
        customPgnButtons,
        customButtons
    })
    transactionPages.push({userID: ctx.user.userID, messageID: msg.message.id, pageList: pages, transactions: userTransactions, lastUsed: new Date()})
}

const listTransactionPage = async (ctx, modalPage) => {
    timeoutTransactionPages(ctx)
    let activeEntry = transactionPages.findIndex(x => x.userID === ctx.arguments[0]) >= 0? transactionPages.findIndex(x => x.userID === ctx.user.userID): false
    if (activeEntry === false) {
        await ctx.send(ctx, {
            embed: ctx.interaction.message.embeds[0],
            parent: true
        })
        return ctx.interaction.channel.createMessage({
            embeds: [
                {
                    description: `The transactions list you have attempted to interact with has expired. They expire after 15 minutes of inactivity or after a bot restart. Please run the command again!`,
                    color: ctx.colors.red
                }
            ],
            messageReference: {messageID: ctx.interaction.message.id}
        })
    }
    let entry = transactionPages[activeEntry]
    entry.lastUsed = new Date()
    transactionPages[activeEntry] = entry
    let page = modalPage !== undefined? modalPage: ctx.arguments.pop()
    page = page === 'first'? 0: page === 'last'? entry.pageList.length - 1 : Number(page)
    const customPgnButtons = []
    const nextPage = page + 1 >= entry.pageList.length? 'first': page + 1
    const backPage = page - 1 < 0? 'last' : page - 1
    customPgnButtons.push(new Button(`trans_list-${ctx.user.userID}-${backPage}`).setStyle(1).setLabel('Back'))
    customPgnButtons.push(new Button(`trans_list-${ctx.user.userID}-${nextPage}`).setStyle(1).setLabel('Next'))
    if (entry.pageList.length >= 15) {
        customPgnButtons.push(new Button(`trans_modal-${ctx.user.userID}`).setStyle(2).setLabel('Jump To...'))
    }
    let pages = [...entry.pageList]
    if (page !== -1) {
        const [removedItem] = pages.splice(page, 1)
        pages.unshift(removedItem)
    }
    const customButtons = []
    customButtons.push(new Button(`trans_info-${ctx.user.userID}-${page * 10}`).setStyle(2).setLabel('Show Info'))
    return ctx.send(ctx, {
        pages,
        embed: {
            title: `${ctx.user.username}, your transactions (${entry.transactions.length} results)`,
            description: 'Processing...',
            footer: {
                text: `Page ${page + 1}/${entry.pageList.length}`,
            }
        },
        customPgnButtons,
        customButtons,
        parent: true
    })
}

const listTransactionCustomPage = async (ctx) => {
    return listTransactionPage(ctx, isNaN(Number(ctx.options.pageNumber))? 0: Number(ctx.options.pageNumber) - 1)
}

const listTransactionModal = async (ctx) => {
    if (ctx.arguments[0] !== ctx.user.userID) {
        await ctx.interaction.defer(64)
        return ctx.interaction.createFollowup({
            embeds: [{
                description: `${ctx.user.username}, you cannot interact with another user's interaction!`,
                color: ctx.colors.red
            }]
        })
    }
    return ctx.interaction.createModal({
        title: 'Enter Your Page Number',
        customID: `trans_custom-${ctx.user.userID}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'pageNumber',
                        label: 'Page Number',
                        style: 1,
                        minLength: 1,
                        maxLength: 6,
                        placeholder: 'Enter the page number to navigate to',
                        required: true
                    }
                ]
            },
        ]
    })
}

const showTransactionInfo = async (ctx, modalPage) => {
    let activeEntry = transactionPages.findIndex(x => x.userID === ctx.arguments[0]) >= 0? transactionPages.findIndex(x => x.userID === ctx.user.userID): false
    if (activeEntry === false) {
        await ctx.send(ctx, {
            embed: ctx.interaction.message.embeds[0],
            parent: true
        })
        return ctx.interaction.channel.createMessage({
            embeds: [
                {
                    description: `The transactions list you have attempted to interact with has expired. They expire after 15 minutes of inactivity or after a bot restart. Please run the command again!`,
                    color: ctx.colors.red
                }
            ],
            messageReference: {messageID: ctx.interaction.message.id}
        })
    }
    let entry = transactionPages[activeEntry]
    entry.lastUsed = new Date()
    if (!entry.infoPages) {
        entry.infoPages = []
        let entryLength = entry.transactions.length
        await Promise.all(entry.transactions.map(async (x, i) => entry.infoPages[i] = await formatTransactionInfo(ctx, x, i, entryLength)))
    }
    transactionPages[activeEntry] = entry
    let page = modalPage !== undefined? modalPage: ctx.arguments.pop()
    page = page === 'first'? 0: page === 'last'? entry.infoPages.length - 1 : Number(page)
    const customPgnButtons = []
    const nextPage = page + 1 >= entry.infoPages.length? 'first': page + 1
    const backPage = page - 1 < 0? 'last' : page - 1
    customPgnButtons.push(new Button(`trans_info-${ctx.user.userID}-${backPage}`).setStyle(1).setLabel('Back'))
    customPgnButtons.push(new Button(`trans_info-${ctx.user.userID}-${nextPage}`).setStyle(1).setLabel('Next'))
    let pages = [...entry.infoPages]
    if (page !== -1) {
        const [removedItem] = pages.splice(page, 1)
        pages.unshift(removedItem)
    }
    const customButtons = []
    if (pages.length >= 15) {
        customPgnButtons.push(new Button(`trans_info_modal-${ctx.user.userID}`).setStyle(2).setLabel('Jump To...'))
    }
    customButtons.push(new Button(`trans_cfm-${entry.transactions[page].transactionID.replaceAll(/-/g, "O")}`).setStyle(3).setLabel('Accept').setOff(entry.transactions[page].toID !== ctx.user.userID || entry.transactions[page].status !== 'pending'))
    customButtons.push(new Button(`trans_dcl-${entry.transactions[page].transactionID.replaceAll(/-/g, "O")}`).setStyle(4).setLabel('Decline').setOff(entry.transactions[page].status !== 'pending'))
    customButtons.push(new Button(`trans_list-${ctx.user.userID}-${Math.floor(page / 10)}`).setStyle(2).setLabel('Show Pages'))
    return ctx.send(ctx, {
        pages,
        embed: {
            title: `Transaction #${page + 1}`,
            description: 'Test Info',
            footer: {
                text: `Page ${page + 1}/${entry.infoPages.length}`,
            }
        },
        switchPage: (data) => data.embed = data.pages[data.pageNum],
        customPgnButtons,
        customButtons,
        parent: true
    })
}

const showCustomTransactionInfo = async (ctx) => {
    return showTransactionInfo(ctx, isNaN(Number(ctx.options.pageNumber))? 0: Number(ctx.options.pageNumber) - 1)
}

const showCustomTransactionInfoModal = async (ctx) => {
    if (ctx.arguments[0] !== ctx.user.userID) {
        await ctx.interaction.defer(64)
        return ctx.interaction.createFollowup({
            embeds: [{
                description: `${ctx.user.username}, you cannot interact with another user's interaction!`,
                color: ctx.colors.red
            }]
        })
    }
    return ctx.interaction.createModal({
        title: 'Enter Your Page Number',
        customID: `trans_info_custom-${ctx.user.userID}`,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'pageNumber',
                        label: 'Page Number',
                        style: 1,
                        minLength: 1,
                        maxLength: 6,
                        placeholder: 'Enter the page number to navigate to',
                        required: true
                    }
                ]
            },
        ]
    })
}

const timeoutTransactionPages = (ctx) => transactionPages = transactionPages.filter(x => (ctx.minToMS(15) + new Date(x.lastUsed).getTime()) > new Date().getTime())
const filterDuplicatePages = (ctx) => transactionPages = transactionPages.filter(x => ctx.user.userID !== x.userID)