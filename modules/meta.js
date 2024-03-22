const {
    Cards
} = require("../collections")

const fetchCardInfo = async (ctx, cardID) => {
    let info = ctx.cardInfos[cardID]

    if (!info) {
        info = new Cards()
        info.cardID = cardID
        info.meta.added = new Date()
        await info.save()
        ctx.cardInfos[cardID] = info
    }

    return info
}

const bulkIncrementOwnerCount = async (ctx, cardIDs, inc = 1) => {

}

module.exports = {
    fetchCardInfo,
}