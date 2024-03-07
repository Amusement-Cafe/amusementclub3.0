const {
    cmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    UserCards,
} = require("../collections")


cmd(['fav', 'one'], async (ctx, user, args) => await favoriteOne(ctx, user, args))

cmd(['fav', 'many'], async (ctx, user, args) => await favoriteMany(ctx, user, args))

cmd(['fav', 'remove', 'one'], async (ctx, user, args) => await favoriteRemoveOne(ctx, user, args))

cmd(['fav', 'remove', 'many'], async (ctx, user, args) => await favoriteRemoveMany(ctx, user, args))


const favoriteOne = withCards(async (ctx, user, args, cards) => {
    let card = cards.filter(x => !x.fav)[0]

    if (!card) {
        card = cards[0]
        return ctx.reply(user, `card ${formatCard(ctx, card)} is already marked as favorite`, 'red')
    }

    await UserCards.updateOne({cardID: card.id, userID: user.userID}, {fav: true})
    return ctx.reply(user, `marked ${formatCard(ctx, card)} as favorite`)
})

const favoriteMany = withCards(async (ctx, user, args, cards) => {
    cards = cards.filter(x => !x.fav)

    if (cards.length === 0)
        return ctx.reply(user, `all cards from that request are already marked as favorite`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `**${user.username}**, do you want to mark **${cards.length}** cards as favorite?`,
            footer: { text: `Favorite cards can be accessed with -fav in card_query`}
        },
        onConfirm: async () => {
            await UserCards.updateMany({userID: user.userID, cardID: {$in: cards.map(c => c.id)}}, {fav: true})
            return ctx.reply(user, `marked **${cards.length}** cards as favorite`, 'green', {edit:true})
        }
    })
})

const favoriteRemoveOne = withCards(async (ctx, user, args, cards) => {
    let card = cards.filter(x => x.fav)[0]

    if (!card) {
        card = cards[0]
        return ctx.reply(user, `card ${formatCard(ctx, card)} is not marked as favorite`, 'red')
    }

    await UserCards.updateOne({cardID: card.id, userID: user.userID}, {fav: false})
    return ctx.reply(user, `removed ${formatCard(ctx, card)} from favorite list`)
})

const favoriteRemoveMany = withCards(async (ctx, user, args, cards) => {
    cards = cards.filter(x => x.fav)

    if (cards.length === 0)
        return ctx.reply(user, `no cards found marked as favorite`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `**${user.username}**, do you want to remove **${cards.length}** cards from your favorite list?`
        },
        onConfirm: async () => {
            await UserCards.updateMany({userID: user.userID, cardID: {$in: cards.map(c => c.id)}}, {fav: false})
            return ctx.reply(user, `removed **${cards.length}** cards from your favorite list`, 'green', {edit:true})
        }
    })
})