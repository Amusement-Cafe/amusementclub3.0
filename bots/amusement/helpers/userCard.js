const UserCards = require('../../../db/userCard')


const withCards = async (ctx, args) => {
    let userCards
    userCards = await getUserCardsLean(ctx)
    userCards  = await mergeUserCards(ctx, userCards)
    if (args.forgeQuery1) {
        let forgeCards1 = userCards
        let forgeCards2 = userCards
        args.forgeQuery1?.filters?.map(x => forgeCards1 = forgeCards1.filter(x))
        if (args.forgeQuery2) {
            args.forgeQuery2?.filters?.map(x => forgeCards2 = forgeCards2.filter(x))
        } else {
            forgeCards2 = forgeCards1
        }
        return [forgeCards1, forgeCards2]
    }
    args.cardQuery?.filters?.map(x => {
        userCards = userCards.filter(x)
        return userCards
    })
    userCards.sort(args.cardQuery.sort)
    return userCards
}

const addUserCards = async (userID, cardIDs) => {
    const writes = cardIDs.map((id) => {
        return {
            updateOne: {
                filter: {
                    userID: userID,
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

const removeUserCards = async (userID, cardIDs, count) => {
    const update = await UserCards.updateMany(
        {
        userID: userID,
        cardID: {$in: cardIDs}
        },
        {
            $inc: {amount: count? -count: -1}
        }
    )

    await UserCards.deleteMany({
        userID: userID,
        amount: 0
    })

    return update
}

const getUserCards = (ctx, otherID = false) => {
    if (otherID) {
        return UserCards.find({userID: otherID})
    }
    return UserCards.find({userID: ctx.user.userID})
}
const getUserCardsLean = (ctx, otherID = false) => {
    if (otherID) {
        return UserCards.find({userID: otherID}).lean()
    }
    return UserCards.find({userID: ctx.user.userID}).lean()
}

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