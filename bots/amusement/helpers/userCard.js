const UserCards = require('../../../db/userCard')


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

const getUserCards = async (ctx) => {
    return UserCards.find({userID: ctx.user.userID})
}

module.exports = {
    addUserCards,
    removeUserCards,
    getUserCards,
}