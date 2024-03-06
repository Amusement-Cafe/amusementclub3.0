const _ = require('lodash')

const {
    firstBy,
} = require("thenby")

const {
    getAllUserCards,
} = require("./usercards")

const {
    wishlistGet,
}  = require("./wishlist")


const raritySymbols = [':star:', '<:bronze:1194177321511419904>', '<:silver:1194177323302408222>', '<:gold:1194177324485185556>']

const formatCard = (ctx, card) => {
    const col = ctx.collections.find(x => x.id == card.col)
    const symbols = col.symbols? col.symbols: raritySymbols
    const rarity = new Array(card.level + 1).join(symbols[card.level] || symbols[0])
    const name = card.displayName || card.name.replace(/_/g, ' ')
    return `[${rarity}]${card.locked? ' `🔒`': ''}${card.fav? ' `❤`' : ''} [${name}](${card.shorturl}) \`[${card.col}]\``
}

const withCards = (callback, options) => async (ctx, user, args) => {
    let cards

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

    cards.sort(args.cardQuery? args.cardQuery.sort: firstBy((a, b) => b.level - a.level).thenBy("col").thenBy("name"))

    return callback(ctx, user, args, cards)
}

module.exports = {
    formatCard,
    withCards
}