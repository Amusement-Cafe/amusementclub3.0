const {
    cmd,
} = require('../utils/cmd')

const {
    Plots
} = require('../collections')

const {
    getPlotCost,
    withPlots,
} = require('../modules/plot')

cmd(['plot', 'list'], async (ctx, user, args) => await plotList(ctx, user, args))

cmd(['plot', 'list', 'global'], async (ctx, user, args) => await plotListGlobal(ctx, user, args))

cmd(['plot', 'buy'], async (ctx, user, args) => await plotBuy(ctx, user, args))

cmd(['plot', 'upgrade'], async (ctx, user, args) => await plotUpgrade(ctx, user, args))

cmd(['plot', 'info'], async (ctx, user, args) => await plotInfo(ctx, user, args))

cmd(['plot', 'info', 'global'], async (ctx, user, args) => await plotInfoGlobal(ctx, user, args))

cmd(['plot', 'collect'], async (ctx, user, args) => await plotCollect(ctx, user, args))

cmd(['plot', 'demolish'], async (ctx, user, args) => await plotDemolish(ctx, user, args))

cmd(['plot', 'demolish', 'global'], async (ctx, user, args) => await plotDemolishGlobal(ctx, user, args))

const plotList = withPlots(async (ctx, user, args, plots) => {
    if (plots.length === 0)
        return ctx.reply(user, `you have no plots in this guild! Buy one now with \`/plot buy\` and check out \`/help\` for more information on plots!`, 'red')

    let pages = []

    plots.map((x, i) => {
        if (i % 20 === 0)
            pages.push("`Plot # | Building | Level | Lemons`\n")
        let building = x.building.id? `${x.building.id.padEnd(8)} | ${x.building.level.toString().padEnd(5)} | ${x.building.storedLemons}🍋`: 'None     | N/A   | N/A'
        pages[Math.floor(i/20)] += `\`${(i+1).toString().padEnd(6)} | ${building}\`\n`
    })

    return ctx.sendInteraction(ctx, user, {
        pages,
        embed: {
            author: { name: `${user.username}, you have ${plots.length} plots in this guild`},
        }
    })
})

const plotListGlobal = withPlots(async (ctx, user, args, plots) => {
    if (plots.length === 0)
        return ctx.reply(user, `you have no plots! Buy one now with \`/plot buy\` and check out \`/help\` for more information on plots!`, 'red')

    plots.sort((a, b) => a.guildID - b.guildID)

    let pages = []

    plots.map((x, i) => {
        if (i % 20 === 0)
            pages.push("`Plot # | Building | Level | Lemons | Guild Name`\n")
        let building = x.building.id? `${x.building.id.padEnd(8)} | ${x.building.level.toString().padEnd(5)} | ${x.building.storedLemons.toString().padEnd(6)}`: `None     | N/A   | N/A    | ${x.guildName}`
        pages[Math.floor(i/20)] += `\`${(i+1).toString().padEnd(6)} | ${building}\`\n`
    })

    return ctx.sendInteraction(ctx, user, {
        pages,
        embed: {
            author: { name: `${user.username}, you have ${plots.length} plots globally`},
        }
    })
}, true)

const plotBuy = withPlots(async (ctx, user, args, plots) => {
    const nextPlotCost = await getPlotCost(user, plots)

    console.log(nextPlotCost)
    if (user.lemons < nextPlotCost)
        return ctx.reply(user, `you don't have enough lemons to afford another plot!
            You need **${nextPlotCost}**${ctx.symbols.lemons} to purchase your next plot!`, 'red')

    const checks = () => {
        if (user.lemons < nextPlotCost)
            return ctx.reply(user, `you don't have enough lemons to afford another plot!
            You need **${nextPlotCost}**${ctx.symbols.lemons} to purchase your next plot!`, 'red')
    }

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `Would you like to buy a plot in **${ctx.discordGuild.name}**? It will cost you **${nextPlotCost}**${ctx.symbols.lemons}!
            ${plots.filter(x => x.guildID === ctx.discordGuild.id).length >= 6? `**Note that there are currently only ${'6'} buildings available at this time and you cannot have two of the same building in a guild!**`: ``}`
        },
        checks,
        onConfirm: async () => {
            let newPlot = new Plots()
            newPlot.userID = user.userID
            newPlot.guildID = ctx.discordGuild.id
            newPlot.guildName = ctx.discordGuild.name
            await newPlot.save()

            user.lemons -= nextPlotCost
            await user.save()

            let affordablePlots = 1
            while( 25 * (2 ** (plots.length + affordablePlots)) < user.lemons)
                affordablePlots++

            return ctx.reply(user, `you have bought a plot for **${nextPlotCost}**${ctx.symbols.lemons} in **${ctx.discordGuild.name}**!
            You are currently able to buy **${affordablePlots - 1}** more plots in this guild!`, 'green', {edit: true})
        }
    })
}, true)

const plotUpgrade = withPlots(async (ctx, user, args, plots) => {})

const plotInfo = withPlots(async (ctx, user, args, plots) => {})

const plotInfoGlobal = withPlots(async (ctx, user, args, plots) => {}, true)

const plotCollect = withPlots(async (ctx, user, args, plots) => {})

const plotDemolish = withPlots(async (ctx, user, args, plots) => {})

const plotDemolishGlobal = withPlots(async (ctx, user, args, plots) => {}, true)