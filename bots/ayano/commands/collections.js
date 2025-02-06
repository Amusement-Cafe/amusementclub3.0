const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {Collections} = require("../../../db");
const _ = require("lodash");


registerBotCommand(['set', 'alias'], async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, `Nothing found`)
    }

    if (!ctx.args.remove) {
        ctx.args.aliases = ctx.args.aliases.filter(x => !col.aliases.some(y => y === x))

        if (ctx.args.aliases.length === 0) {
            return ctx.send(ctx, `You have supplied aliases that already exist for ${col.name}`)
        }


        return ctx.send(ctx, {
            embed: {
                description: `Add aliases \`${ctx.args.aliases.join(', ')}\` to collection ${col.name}?`,
            },
            confirmation: true,
            onConfirm: async () => {
                ctx.args.aliases.map(x => col.aliases.push(x))
                await col.save()
                ctx.global.collections = await Collections.find()
                await ctx.send(ctx, 'confirmed')
            }
        })
    } else {
        ctx.args.aliases = ctx.args.aliases.filter(x => col.aliases.some(y => y === x))

        if (ctx.args.aliases.length === 0) {
            return ctx.send(ctx, `You have supplied aliases that don't exist for ${col.name}`)
        }

        return ctx.send(ctx, {
            embed: {
                description: `Remove aliases \`${ctx.args.aliases.join(', ')}\` from collection ${col.name}?`,
            },
            confirmation: true,
            onConfirm: async () => {
                col.aliases = col.aliases.filter(x => !ctx.args.aliases.some(y => x === y))
                await col.save()
                ctx.global.collections = await Collections.find()
                await ctx.send(ctx, 'confirmed')
            }
        })
    }
})

registerBotCommand(['set', 'author'], async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
})

registerBotCommand(['set', 'compression'], async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }

    col.compressed = !col.compressed
    await col.save()
    ctx.global.collections = await Collections.find()
    await ctx.send(ctx, `Set compression status to ${col.compressed}!`)
})

registerBotCommand(['set', 'display'], async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
})

registerBotCommand(['set', 'rarity'], async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
})