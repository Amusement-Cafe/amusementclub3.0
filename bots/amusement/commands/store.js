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

const displayItem = async (ctx, disable = false) => {
    const itemSplit = ctx.arguments[0].split('-')
    const item = itemSplit[0]
    const category = itemSplit[1]
    const buyItem = new Button(`storeBuy-${item}-${category}`).setLabel('Buy Now!').setStyle(3).setOff(disable)
    await ctx.send(ctx, {
        embed: embeds[item],
        customButtons: [homeButton, buyItem],
        parent: true
    })
}

const buyItem = async (ctx) => {
    switch (ctx.arguments[1]) {
        case 'ticket':
            return await purchaseTicket(ctx)
        case 'guild':
            return await purchaseGuildBuilding(ctx)
        case 'bonus':
            return await purchaseBonus(ctx)
        case 'recipe':
            return await purchaseRecipe(ctx)
        case 'blueprint':
            return await purchasePlotBuilding(ctx)
    }
}

const purchaseTicket = async (ctx) => {
    await ctx.interaction.defer()
    let cost = ctx.items[ctx.arguments[0]].cost
    if (ctx.user.lemons < cost) {
        return ctx.send(ctx, `You have insufficient lemons to purchase ${ctx.boldName(ctx.arguments[0])}`, 'red')
    }
    return ctx.send(ctx, `You tried to purchase ${ctx.boldName(ctx.arguments[0])} for ${ctx.boldName(cost)}${ctx.symbols.lemon}!`, 'deepgreen')
    console.log('ticket')
}
const purchaseGuildBuilding = async (ctx) => {
    console.log('guild')
}
const purchaseRecipe = async (ctx) => {
    console.log('recipe')
}
const purchaseBonus = async (ctx) => {
    console.log('bonus')
}
const purchasePlotBuilding = async (ctx) => {
    console.log('plot')
}