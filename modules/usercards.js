const UserCards = require("../collections/usercard")


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

const getSpecificUserCards = async (user, cardIDs, lean = true) => {
    if (lean)
        return UserCards.find({ userID: user.userID, cardID: {$in: cardIDs }}).lean()
    return UserCards.find({ userID: user.userID, cardID: {$in: cardIDs }})
}

const getAllUserCards = async (user, lean = true) => {
    if (lean)
        return UserCards.find({ userID: user.userID }).lean()
    return UserCards.find({ userID: user.userID })
}

module.exports = {
    addUserCards,
    getAllUserCards,
    getSpecificUserCards,
}