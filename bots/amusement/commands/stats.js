const _ = require('lodash')

const {
    AsciiTable3,
} = require("ascii-table3")

const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    getAllUserStats,
    mapStatToName,
} = require('../helpers/stats')

const {
    Button
} = require("../helpers/componentBuilders")

registerBotCommand('stats', async (ctx) => await stats(ctx))
registerReaction(['stat', 'page'], async (ctx) => await stats(ctx))

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

const stats = async (ctx) => {
    let page = 0
    let parent
    if (ctx.arguments) {
        page = Number(ctx.arguments[0])
        parent = true
    }
    const statArray = [{}, {}, {}, {}]
    const weeklyTime = weekStart()
    const monthlyTime = monthStart()
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
        table.setStyle(`unicode-${ctx.user.preferences.display.tables}`)
        if (!Object.keys(statArray[stat]).length) {
            table.addRow('No data to display for this table!')
            pages.push(`\`\`\`${table.toString()}\`\`\``)
            continue
        }
        if (stat == 3) {
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

    const back = new Button(`stat_page-${page - 1 < 0? 3: page - 1}`).setStyle(1).setLabel('Back')
    const next = new Button(`stat_page-${page + 1 > 3? 0: page + 1}`).setStyle(1).setLabel('Next')

    let display = _.pullAt(pages, page)
    pages.unshift(display[0])

    return ctx.send(ctx, {
        pages,
        customPgnButtons: [back, next],
        embed: {
            description: 'stat',
            footer: {
                text: `Page ${page+1}/4`,
            }
        },
        parent: parent,
    })
}