const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    Button,
    Selection
} = require('../helpers/componentBuilders')

const menus = require('../static/menus/store/store.json')
const embeds = require('../static/embeds/store.json')

const homeButton = new Button('store_all').setLabel('Main Menu').setStyle(2)

registerBotCommand(['store'], async (ctx) => await storeStart(ctx))

registerReaction(['store', 'all'], async (ctx) => await storeStart(ctx, true))
registerReaction(['storeMenu'], async (ctx) => await displayStore(ctx))
registerReaction(['storeItem'], async (ctx) => await displayItem(ctx))
registerReaction(['storeBuy'], async (ctx) => await buyItem(ctx))

const storeStart = async (ctx, back = false) => {
    const mainMenu = new Selection('storeMenu').setOptions(menus.all)
    await ctx.send(ctx, {
        embed: embeds.mainMenu,
        selection: [mainMenu],
        parent: back
    })
}

const displayStore = async (ctx) => {
    const menu = ctx.arguments[0]
    const options = menus[menu]
    const newMenu = new Selection('storeItem').setOptions(options)
    await ctx.send(ctx, {
        embed: embeds[menu],
        customButtons: [homeButton],
        selection: [newMenu],
        parent: true
    })
}

const displayItem = async (ctx) => {
    const item = ctx.arguments[0]
    const buyItem = new Button(`storeBuy-${item}`).setLabel('Buy Now!').setStyle(3)
    await ctx.send(ctx, {
        embed: embeds[item],
        customButtons: [homeButton, buyItem],
        parent: true
    })
}

const buyItem = async (ctx) => {
    await ctx.interaction.defer()
    console.log(ctx.arguments)
    return ctx.send(ctx, {
        embed: {
            description: `${ctx.user.username} you definitely just bought ${ctx.arguments}!`,
            color: ctx.colors.green
        },

    })
}