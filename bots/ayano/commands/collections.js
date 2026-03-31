const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {generateGlobalCommand} = require("../../../utils/commandGeneration")
const {Collections} = require("../../../db")
const _ = require("lodash")


registerBotCommand(['set', 'alias'], async (ctx) => await setAlias(ctx))

registerBotCommand(['set', 'author'], async (ctx) => await setAuthor(ctx))

registerBotCommand(['set', 'compression'], async (ctx) => await setCompression(ctx))

registerBotCommand(['set', 'display'], async (ctx) => await setDisplay(ctx))

registerBotCommand(['set', 'rarity'], async (ctx) => await setRarity(ctx))
generateGlobalCommand('set', 'Top Level Set')
    .subCommand('alias', 'Set an alias for a collection')
    .string('collection', 'The collection receiving an alias')
    .required()
    .string('alias', 'The alias(es) to add to the collection. Space separated')
    .required()
    .boolean('remove', 'Select whether you are removing aliases or not. (Default is false)')
    .close()
    .subCommand('author', `Set a collection's Author`)
    .string('collection', 'The collection receiving an author')
    .required()
    .userID('The mention or discord ID of the author')
    .required()
    .close()
    .subCommand('compression', 'Toggle a collection between compressed and non-compressed images')
    .string('collection', 'The collection to toggle compression for')
    .required()
    .close()
    .subCommand('display', `Set a collection's display name`)
    .string('collection', 'The collection to update the display name for')
    .required()
    .string('display_name', 'The display name to set the collection to')
    .required()
    .close()
    .subCommand('rarity', `Set a rarity for a collection`)
    .string('collection', 'The collection to update rarity for')
    .required()
    .integer('rarity', 'The rarity to set the collection to as a whole number, 5% = 5')
    .close()

const setAlias = async (ctx) => {
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
}

const setAuthor = async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
}

const setCompression = async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }

    col.compressed = !col.compressed
    await col.save()
    ctx.global.collections = await Collections.find()
    await ctx.send(ctx, `Set compression status to ${col.compressed}!`)
}

const setDisplay = async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
}

const setRarity = async (ctx) => {
    const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

    if (!col) {
        return ctx.send(ctx, 'Nothing found')
    }
}