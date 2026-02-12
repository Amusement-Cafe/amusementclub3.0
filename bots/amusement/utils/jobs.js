const {evalCards} = require('../helpers/eval')
const {finishAuction} = require("../helpers/auctions")

let tickArray = []

const evalQueue = (ctx) => {
    evalCards(ctx)
}

const auctionQueue = (ctx) => {
    finishAuction(ctx)
}

const startTicks = (ctx) => {
    const evalTick = setInterval(evalQueue.bind({}, ctx), 1000 * 60 * 1)
    const auctionTick = setInterval(auctionQueue.bind({}, ctx), 1000 * 5)
    tickArray = [evalTick, auctionTick]
}

const stopTicks = () => {
    tickArray.map(x => clearInterval(x))
}

module.exports = {
    startTicks,
    stopTicks,
}