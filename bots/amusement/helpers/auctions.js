const Auctions = require('../../../db/auction')


const createAuction = async () => {

}

const bidAuction = async (add = false) => {

}

const finishAuction = async () => {
    const auctionToFinish = await Auctions.findOne({expires: {$lt: new Date()}})
    if (!auctionToFinish) {
        return
    }

}

const cancelAuction = async () => {

}

const listAuctions = async () => {

}


module.exports = {
    cancelAuction,
    createAuction,
    bidAuction,
    finishAuction,
    listAuctions,
}