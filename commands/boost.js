const {
    cmd,
} = require('../utils/cmd')

const {
    formatDateTimeRelative,
} = require('../utils/tools')

const {
    formatCard,
} = require("../modules/card")

cmd(['boost', 'list'], async (ctx, user, args) => await boostList(ctx, user, args))

cmd(['boost', 'info'], async (ctx, user, args) => await boostInfo(ctx, user, args))

//To-do Add promos to the display lists
const boostList = async (ctx, user, args) => {
    const now = new Date()
    const boosts = ctx.boosts.filter(x => x.starts < now && x.expires > now).sort((a, b) => a.expires - b.expires)

    if (boosts.length === 0)
        return ctx.reply(user, `no boosts or events currently active!`, 'red')

    const description = boosts.map(x => `[${formatDateTimeRelative(new Date(x.expires))}] **${x.rate * 100}%** rate for **${x.name}** (\`/claim cards boost_id:${x.id}\`)`).join('\n')

    return ctx.sendInteraction(ctx, user, {
        embed: {
            title: 'Current Boosts and Events',
            description,
        }
    })
}

const boostInfo = async (ctx, user, args) => {
    const boost = ctx.boosts.find(x => x.id === args.boostID)

    if (!boost)
        return ctx.reply(user, `boost with ID \`${args.boostID}\` was not found`, 'red')

    const list = [
        `Rate: **${boost.rate * 100}%**`,
        `Cards in pool: **${boost.cards.length}**`,
        `Command: \`/claim cards boost_id:${boost.id}\``,
        `Expires in **${formatDateTimeRelative(new Date(boost.expires))}**`
    ]

    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(boost.cards.map(c => formatCard(ctx, ctx.cards[c])), 15, 1024),
        switchPage: (data) => data.embed.fields[0].value = data.pages[data.pagenum],
        embed: {
            author: { name: `${boost.name} boost` },
            description: list.join('\n'),
            color: ctx.colors.blue,
            fields: [{
                name: "You can get any of these cards:",
                value: ""
            }]
        }
    })
}