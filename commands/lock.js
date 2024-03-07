const {
    cmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    UserCards
} = require("../collections")

cmd(['lock', 'one'], async (ctx, user, args) => await lockOne(ctx, user, args))

cmd(['lock', 'many'], async (ctx, user, args) => await lockMany(ctx, user, args))

cmd(['lock', 'remove', 'one'], async (ctx, user, args) => await lockRemoveOne(ctx, user, args))

cmd(['lock', 'remove', 'many'], async (ctx, user, args) => await lockRemoveMany(ctx, user, args))

const lockOne = withCards(async (ctx, user, args, cards) => {
    let card = cards.filter(x => !x.locked)[0]

    if (!card) {
        card = cards[0]
        return ctx.reply(user, `card ${formatCard(ctx, card)} is already locked`, 'red')
    }

    await UserCards.updateOne({cardID: card.id, userID: user.userID}, {locked: true})
    return ctx.reply(user, `locked ${formatCard(ctx, card)}`)
})

const lockMany = withCards(async (ctx, user, args, cards) => {
    cards = cards.filter(x => !x.locked)

    if (cards.length === 0)
        return ctx.reply(user, `all cards from that request are already locked`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(x => formatCard(ctx, x)), 15),
        switchPage: (data) => {
            data.embed.description = data.pages[data.pageNum]
            data.embed.footer = {text: `${data.pageNum + 1}/${data.pages.length} || Locked cards can be shown with -locked`}
        },
        embed: {
            title: `**${user.username}**, do you want to lock **${cards.length}** cards?`,
            footer: { text: `Locked cards can be shown with -locked in card_query`},
            color: ctx.colors.yellow
        },
        onConfirm: async () => {
            await UserCards.updateMany({userID: user.userID, cardID: {$in: cards.map(c => c.id)}}, {locked: true})
            return ctx.reply(user, `locked **${cards.length}** cards`, 'green', {edit:true})
        }
    })
})

const lockRemoveOne = withCards(async (ctx, user, args, cards) => {
    let card = cards.filter(x => x.locked)[0]

    if (!card) {
        card = cards[0]
        return ctx.reply(user, `card ${formatCard(ctx, card)} is not locked`, 'red')
    }

    await UserCards.updateOne({cardID: card.id, userID: user.userID}, {locked: false})
    return ctx.reply(user, `unlocked ${formatCard(ctx, card)}`)
})

const lockRemoveMany = withCards(async (ctx, user, args, cards) => {
    cards = cards.filter(x => x.locked)

    if (cards.length === 0)
        return ctx.reply(user, `all cards from that request are already unlocked`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(x => formatCard(ctx, x)), 15),
        switchPage: (data) => {
            data.embed.description = data.pages[data.pageNum]
        },
        embed: {
            title: `**${user.username}**, do you want to unlock **${cards.length}** cards?`,
            color: ctx.colors.yellow
        },
        onConfirm: async () => {
            await UserCards.updateMany({userID: user.userID, cardID: {$in: cards.map(c => c.id)}}, {locked: false})
            return ctx.reply(user, `unlocked **${cards.length}** cards`, 'green', {edit:true})
        }
    })
})
