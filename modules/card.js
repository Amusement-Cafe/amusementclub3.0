const _ = require('lodash')

const {
    Cards
} = require('../collections')

const {
    firstBy,
} = require("thenby")

const {
    getAllUserCards,
} = require("./usercards")

const {
    wishlistGet,
}  = require("./wishlist")


const formatCard = (ctx, card) => {
    const col = ctx.collections.find(x => x.collectionID == card.collectionID)
    const symbols = col.stars
    const rarity = new Array(card.level + 1).join(symbols[card.level] || symbols[0])
    console.log(card)
    const name = card.displayName || card.cardName.replace(/_/g, ' ')
    return `[${rarity}]${card.locked? ' `🔒`': ''}${card.fav? ' `❤`' : ''} [${name}](${card.shorturl}) \`[${card.collectionID}]\``
}

const withCards = (callback, options) => async (ctx, user, args) => {
    let cards

    if (args.forgeArgs1) {
        cards = await getAllUserCards(user, true)
        cards = cards.filter(x => x.cardID < ctx.cards.length).map(x => Object.assign({}, ctx.cards[x.cardID], x))
        let batchCards1 = cards
        let batchCards2 = cards

        args.forgeArgs1.filters?.map(x => batchCards1 = batchCards1.filter(x))
        batchCards1.sort(args.forgeArgs1.sort)

        if (args.forgeArgs2) {
            args.forgeArgs2.filters?.map(x => batchCards2 = batchCards2.filter(x))
            batchCards2.sort(args.forgeArgs2.sort)
        } else {
            batchCards2 = batchCards1
        }

        return callback(ctx, user, args, [batchCards1, batchCards2])
    }

    if (!options?.global || args.userQuery) {
        cards = await getAllUserCards(user)

        cards = cards.filter(x => x.cardID < ctx.cards.length).map(x => Object.assign({}, ctx.cards[x.cardID], x))
        args.cardQuery?.filters?.map(x => cards = cards.filter(x))
        if (args.cardQuery?.wish) {
            let wishCards = await wishlistGet(user)
            if (args.cardQuery.wish === 2)
                _.pullAll(cards, wishCards.map(x => x.cardID))
            else
                cards = cards.filter(x => _.includes(wishCards, x.cardID))
        }
    } else {
        cards = ctx.cards.slice().map(x => Object.assign({}, ctx.cards[x.cardID], x))
        args.cardQuery?.filters?.map(x => cards = cards.filter(x))
    }


    if (!options?.allowEmpty && cards.length === 0)
        return ctx.reply(user, `no cards found`)

    cards.sort(args.cardQuery.sort)

    return callback(ctx, user, args, cards)
}

const fetchAllCards = async () => await Cards.find().lean()

module.exports = {
    fetchAllCards,
    formatCard,
    withCards
}