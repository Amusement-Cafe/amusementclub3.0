const UserCards = require('../collections/usercard')

const raritySymbols = [':star:', '<:bronze:1194177321511419904>', '<:silver:1194177323302408222>', '<:gold:1194177324485185556>']

const formatCard = (ctx, card) => {
    const col = ctx.collections.find(x => x.id == card.col)
    const symbols = col.symbols? col.symbols: raritySymbols
    const rarity = new Array(card.level + 1).join(symbols[card.level] || symbols[0])
    const name = card.displayName || card.name.replace(/_/g, ' ')
    return `[${rarity}]${card.locked? ' `🔒`': ''}${card.fav? ' `❤`' : ''} [${name}](${card.shorturl}) \`[${card.col}]\``
}

const withCards = (callback, global = false) => async (ctx, user, args) => {
    let cards

    if (!global || args.userQuery) {
        cards = await UserCards.find({ userID: user.userID }).lean()

        cards = cards.filter(x => x.cardID < ctx.cards.length).map(x => Object.assign({}, ctx.cards[x.cardID], x)).sort((a, b) => b.level - a.level)
        args.cardQuery?.filters?.map(x => cards = cards.filter(x))

        if (cards.length === 0) {
            cards = `Some error thing here`
        }
    } else {
        cards = ctx.cards.slice()
    }

    return callback(ctx, user, args, cards)
}

const addUserCards = async (ctx, user, cardIDs) => {
    const updates = cardIDs.map(x => ({
        updateOne: {
            filter: {
                userID: user.userID,
                cardID: x,
            },
            update: {
                $inc: { amount: 1 }
            },
            upsert: true,
            setDefaultsOnInsert: true,
        }
    }))
    return await UserCards.bulkWrite(updates)
}

module.exports = {
    addUserCards,
    formatCard,
    withCards
}