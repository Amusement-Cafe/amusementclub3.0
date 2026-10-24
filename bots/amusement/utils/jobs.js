const {
    evalCards
} = require('../helpers/eval')

const {
    createAuction,
    finishAuction
} = require("../helpers/auctions")

const {
    updateGuildInvites
} = require("../helpers/guild")

const {
    checkServerBoosters
} = require("../../ayano/helpers/serverBoosts")

const {
    dailyReminder
} = require("../helpers/user")

let tickArray = []

const fiveMinuteQueue = (ctx) => {
    evalCards(ctx)
}

const secondQueue = (ctx) => {
    createAuction(ctx)
    finishAuction(ctx)
    dailyReminder(ctx)
}

const minuteQueue = (ctx) => {
    updateGuildInvites(ctx)
    checkServerBoosters(ctx)
}

const startTicks = (ctx) => {
    const fiveMinuteTick = setInterval(fiveMinuteQueue.bind({}, ctx), 1000 * 60 * 5)
    const secondTick = setInterval(secondQueue.bind({}, ctx), 1000)
    const minuteTick = setInterval(minuteQueue.bind({}, ctx), 1000 * 60)
    tickArray = [fiveMinuteTick, secondTick, minuteTick]
}

const stopTicks = () => {
    tickArray.map(x => clearInterval(x))
}

module.exports = {
    startTicks,
    stopTicks,
}