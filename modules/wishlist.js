const Wishlists = require("../collections/userwishlist")


const wishlistGet = async (user, cardIDList) => {
    let query = {}
    if (user)
        query.userID = user.userID
    if (cardIDList)
        query.cardID = {$in: cardIDList}

    return Wishlists.find(query).lean()
}

const wishlistAdd = async (user, cardIDList) => {
    const query = cardIDList.map(x => ({
        insertOne: {
            document: {
                userID: user.userID,
                cardID: x,
                added: new Date()
            }
        }
    }))
    return Wishlists.bulkWrite(query)
}

const wishlistRemove = async (user, cardIDList) => {
    const query = cardIDList.map(x => ({
        deleteOne: {
            filter: {
                userID: user.userID,
                cardID: x
            }
        }
    }))

    return Wishlists.bulkWrite(query)
}

module.exports = {
    wishlistAdd,
    wishlistGet,
    wishlistRemove,
}