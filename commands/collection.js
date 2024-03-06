const _ = require('lodash')

const {
    cmd,
} = require('../utils/cmd')

const {
    propertySort,
} = require('../utils/tools')

cmd(['collection', 'list'], async (ctx, user, args) => await collectionList(ctx, user, args))

cmd(['collection', 'info'], async (ctx, user, args) => await collectionInfo(ctx, user, args))

cmd(['collection', 'reset'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'no'})
}

const collectionList = async (ctx, user, args) => {
    let cols = args.cols.length > 0? _.flattenDeep(args.cols): ctx.collections

    if (cols.length === 0)
        return ctx.reply(user, `no collections found!`, 'red')

    cols.sort((a, b) => propertySort(a, b, "id"))

    const pages = ctx.makePages(cols.map(x => `**${x.name}** \`${x.id}\``), 15)

    return ctx.sendInteraction(ctx, user, {
        pages,
        pgnButtons: ["back", "next"],
        embed: {
            author: { name: `found ${cols.length} collections` }
        }
    })
}

const collectionInfo = async (ctx, user, args) => {
    const col = _.flattenDeep(args.cols)[0]

    if (!col)
        return ctx.reply(user, `found 0 collections matching \`${args.colQuery}\``, 'red')

    return ctx.reply(user, `there will be info about **${col.name}** here later`)
}

const collectionReset = async () => {}