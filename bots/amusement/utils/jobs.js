const {evalCards} = require('../helpers/eval')

let tickArray

const evalQueue = (ctx) => {
    // evalCards(ctx)
}

const startTicks = (ctx) => {
    const evalTick = setInterval(evalQueue.bind({}, ctx), 1000 * 60 * 1)
    tickArray = [evalTick]
}

const stopTicks = () => {
    tickArray.map(x => clearInterval(x))
}

module.exports = {
    startTicks,
    stopTicks,
}