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

//To-Do Meta Infos

cmd(['rate', 'one'], async (ctx, user, args) => await rateOne(ctx, user, args))

cmd(['rate', 'remove', 'one'], async (ctx, user, args) => await rateRemoveOne(ctx, user, args))

cmd(['rate', 'many'], async (ctx, user, args) => await rateMany(ctx, user, args))

cmd(['rate', 'remove', 'many'], async (ctx, user, args) => await rateRemoveMany(ctx, user, args))

const rateOne = withCards(async (ctx, user, args, cards) => {
    const card = cards[0]

    await UserCards.updateOne({ cardID: card.id, userID: user.userID }, { rating: args.rating })

    return ctx.reply(user, `set rating **${args.rating}** for ${formatCard(ctx, card)}`)
})

const rateRemoveOne = withCards(async (ctx, user, args, cards) => {
    const card = cards[0]

    if (!card.rating)
        return ctx.reply(user, `you have not set a rating for ${formatCard(ctx, card)}`, 'red')

    await UserCards.updateOne({ cardID: card.id, userID: user.userID }, { rating: 0 })

    return ctx.reply(user, `removed rating for ${formatCard(ctx, card)}`)
})

const rateMany = withCards(async (ctx, user, args, cards) => {
    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(c => formatCard(ctx, c))),
        embed: {
            title: `**${user.username}**, do you want to rate **${cards.length}** cards as ${args.rating}/10?`,
            color: ctx.colors.yellow
        },
        onConfirm: async () => {
            await UserCards.updateMany({ userID: user.userID, cardID: {$in: cards.map(x => x.id )}}, {rating: args.rating })
            return ctx.reply(user, `set rating of **${cards.length}** cards to **${args.rating}/10**`, 'green', {edit: true})
        }
    })
})

const rateRemoveMany = withCards(async (ctx, user, args, cards) => {
    cards = cards.filter(x => x.rating)

    if (cards.length === 0)
        return ctx.reply(user, `all cards in your request are already unrated!`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(c => formatCard(ctx, c))),
        embed: {
            title: `**${user.username}**, do you want to remove the rating from **${cards.length}** cards?`,
            color: ctx.colors.yellow
        },
        onConfirm: async () => {
            await UserCards.updateMany({ userID: user.userID, cardID: {$in: cards.map(x => x.id )}}, {rating: 0 })
            return ctx.reply(user, `removed rating from **${cards.length}** cards`, 'green', {edit: true})
        }
    })
})
