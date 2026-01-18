const _ = require('lodash')

const {
    AsciiTable3,
} = require("ascii-table3")

const {
    registerBotCommand
} = require('../../../utils/commandRegistrar')

const {
    getAllUserStats,
    mapStatToName,
} = require('../helpers/stats')

registerBotCommand('stats', async (ctx) => await stats(ctx))

let weekStart = () => {
    const date = new Date()
    const today = date.getDate()
    const currentDay = date.getDay()
    date.setDate(today - (currentDay || 7))
    date.setHours(23, 59, 59, 999)
    return new Date(date)
}

let monthStart = () => {
    const date = new Date()
    date.setDate(1)
    date.setHours(0, 0, 0, 0)
    return new Date(date)
}

const stats = async (ctx, page = 0) => {
    const statArray = [{}, {}, {}, {}]
    let weeklyTime = weekStart()
    let monthlyTime = monthStart()
    const allStats = await getAllUserStats(ctx)
    let dailyStats = allStats[allStats.length - 1]
    let monthlyStats = allStats.filter(x => x.daily >= monthlyTime)
    let weeklyStats = monthlyStats.filter(x => x.daily >= weeklyTime)
    const keys = _.keys(dailyStats)
    _.pull(keys, '_id', 'daily', 'userID', '__v')
    keys.map(x => {
        const weekAmount = weeklyStats.map(y => y[x]).filter(z => z).reduce((a, b) => a + b, 0)
        const monthAmount = monthlyStats.map(y => y[x]).filter(z => z).reduce((a, b) => a + b, 0)
        const allAmount = allStats.map(y => y[x]).filter(z => z).reduce((a, b) => a + b, 0)
        if (dailyStats[x] > 0) {
            statArray[0][x] = dailyStats[x]
        }
        if (weekAmount > 0) {
            statArray[1][x] = weekAmount
        }
        if (monthAmount > 0) {
            statArray[2][x] = monthAmount
        }
        if (allAmount > 0) {
            statArray[3][x] = allAmount
        }
    })
    let types = ['daily', 'weekly', 'monthly', 'allTime']
    let pages = []
    for (let stat in statArray) {
        const type = types[stat]
        let table = new AsciiTable3(`Your ${type} stats!`)
        table.setStyle('unicode-round')
        if (statArray[stat].length === 0) {
            table.addRow('No data to display for this table!')
            pages.push(`\`\`\`${table.toString()}\`\`\``)
            continue
        }
        if (stat === 3) {
            const allStat = mapStatToName(ctx, 'totalDailies', allStats.length)
            table.addRow(allStat.name, allStat.count)
        }
        keys.map(y => {
            if (!statArray[stat][y]) {
                return
            }
            const mapped = mapStatToName(ctx, y, statArray[stat][y])
            table.addRow(mapped.name, mapped.count)
        })
        table.setAlignLeft(1)
        table.setAlignRight(2)
        pages.push(`\`\`\`${table.toString()}\`\`\``)
    }
    return ctx.send(ctx, {
        pages,
        embed: {
            description: 'stat',
        }
    })
}