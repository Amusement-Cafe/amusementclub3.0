const UserCards = require('../../../db/userCard')


const withCards = async (ctx, args) => {
    let userCards
    userCards = await getUserCardsLean(ctx, ctx.user)
    userCards  = await mergeUserCards(ctx, userCards)
    console.log(userCards.filter(x => x.locked === false).length)
    args.cardQuery?.filters?.map(x => {
        userCards = userCards.filter(x)
        console.log(x.toString())
        return userCards
    })
    userCards.sort(args.cardQuery.sort)
    return userCards
}

const addUserCards = async (ctx, cardIDs) => {
    const writes = cardIDs.map((id) => {
        return {
            updateOne: {
                filter: {
                    userID: ctx.user.userID,
                    cardID: id
                },
                update: {
                    $inc: {amount: 1}
                },
                upsert: true,
                setDefaultsOnInsert: true,
            }
        }
    })

    return await UserCards.bulkWrite(writes)
}

const removeUserCards = async (ctx, cardIDs) => {
    const update = await UserCards.updateMany(
        {
        userID: ctx.user.userID,
        cardID: {$in: cardIDs}
        },
        {
            $inc: {amount: -1}
        }
    )

    await UserCards.deleteMany({
        userID: ctx.user.userID,
        amount: 0
    })

    return update
}

const getUserCards = (ctx) => UserCards.find({userID: ctx.user.userID})
const getUserCardsLean = (ctx) => UserCards.find({userID: ctx.user.userID}).lean()

const mergeUserCards = async (ctx, userCards) => {
    const merged = []
    userCards.map(card => {
        let ctxCard = ctx.cards[card.cardID]
        if (ctxCard.cardID !== card.cardID) {
            console.log(ctxCard.cardID)
        }
        merged.push(Object.assign({}, ctxCard, card))
    })
    return merged
}

module.exports = {
    addUserCards,
    removeUserCards,
    getUserCards,
    getUserCardsLean,
    mergeUserCards,
    withCards,
}