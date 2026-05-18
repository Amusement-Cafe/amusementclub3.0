const {evalCards} = require('../helpers/eval')
const {
    createAuction,
    finishAuction
} = require("../helpers/auctions")

const {
    updateGuildInvites
} = require("../helpers/guild")

let tickArray = []

const evalQueue = (ctx) => {
    evalCards(ctx)
}

const auctionQueue = (ctx) => {
    createAuction(ctx)
    finishAuction(ctx)
}

const guildQueue = (ctx) => {
    updateGuildInvites(ctx)
}

const startTicks = (ctx) => {
    const evalTick = setInterval(evalQueue.bind({}, ctx), 1000 * 60 * 1)
    const auctionTick = setInterval(auctionQueue.bind({}, ctx), 1000)
    const guildTick = setInterval(guildQueue.bind({}, ctx), 1000 * 60)
    tickArray = [evalTick, auctionTick, guildTick]
}

const stopTicks = () => {
    tickArray.map(x => clearInterval(x))
}

module.exports = {
    startTicks,
    stopTicks,
}