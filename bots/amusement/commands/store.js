const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    addItem
} = require("../helpers/userInventory")

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
    let wallet
    let style = 3
    let label = 'Buy Now!'
    switch (category) {
        case 'guild':
            wallet = 0
            break;
        case 'recipe':
        case 'blueprint':
            wallet = ctx.user.tomatoes
            break;
        case 'bonus':
        case 'ticket':
            wallet = ctx.user.lemons
            break;
    }
    if (ctx.items[item].cost > wallet) {
        disable = true
        label = 'Insufficient Funds'
        style = 4
    }
    if (category === 'ticket') {
        let limit = 24
        if (ctx.stats.storeTicket >= limit) {
            label = 'Daily Purchase Limit Reached'
            disable = true
            style = 4
        } else {
            label += ` (${limit - ctx.stats.storeTicket} left)`
        }
    }
    const buyItem = new Button(`storeBuy-${item}-${category}`).setLabel(label).setStyle(style).setOff(disable)
    await ctx.send(ctx, {
        embed: embeds[item],
        customButtons: [homeButton, buyItem],
        parent: true
    })
}

const buyItem = async (ctx) => {
    let item = ctx.items[ctx.arguments[0]]
    switch (ctx.arguments[1]) {
        case 'ticket':
            return await purchaseTicket(ctx, item)
        case 'guild':
            await ctx.interaction.defer()
            return await purchaseGuildBuilding(ctx, item)
        case 'bonus':
            await ctx.interaction.defer()
            return await purchaseBonus(ctx, item)
        case 'recipe':
            await ctx.interaction.defer()
            return await purchaseRecipe(ctx, item)
        case 'blueprint':
            await ctx.interaction.defer()
            return await purchasePlotBuilding(ctx, item)
    }
}

const purchaseTicket = async (ctx, item) => {
    if (ctx.user.lemons < item.cost) {
        return ctx.send(ctx, `You have insufficient lemons to purchase ${ctx.boldName(ctx.arguments[0])}`, 'red')
    }
    await addItem(ctx, item)
    await ctx.interaction.channel.createMessage({
        embeds: [
            {
                description: `${ctx.boldName(ctx.user.username)}, you purchased ${ctx.boldName(item.itemID)} for ${ctx.boldName(ctx.fmtNum(item.cost))}${ctx.symbols.lemon} (actually 0 for testing)!`,
                color: ctx.colors.deepgreen
            }
        ],
        messageReference: {messageID: ctx.interaction.message.id}
    })
    ctx.arguments = [ctx.arguments.join('-')]
    await ctx.updateStat(ctx, 'store', 1)
    await ctx.updateStat(ctx, 'storeTicket', 1)
    await displayItem(ctx, false)
}
const purchaseGuildBuilding = async (ctx, item) => {
    return ctx.send(ctx, `The guild store is currently disabled until guilds are reimplemented!`, 'red')
}
const purchaseRecipe = async (ctx, item) => {
    if (ctx.user.tomatoes < item.cost) {
        return ctx.send(ctx, `You have insufficient tomatoes to purchase ${ctx.arguments[0]}`, 'red')
    }
    await addItem(ctx, item)
    return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you purchased ${ctx.boldName(ctx.arguments[0])} for ${ctx.boldName(ctx.fmtNum(item.cost))}${ctx.symbols.tomato} (actually 0 for testing)!`, 'deepgreen')
}
const purchaseBonus = async (ctx, item) => {
    if (ctx.user.tomatoes < item.cost) {
        return ctx.send(ctx, `You have insufficient tomatoes to purchase ${ctx.arguments[0]}`, 'red')
    }
    await addItem(ctx, item)
    return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you purchased ${ctx.boldName(ctx.arguments[0])} for ${ctx.boldName(ctx.fmtNum(item.cost))}${ctx.symbols.tomato} (actually 0 for testing)!`, 'deepgreen')
}
const purchasePlotBuilding = async (ctx, item) => {
    let cost = item.cost
    if (ctx.user.lemons < cost) {
        return ctx.send(ctx, `You have insufficient lemons to purchase ${ctx.boldName(ctx.arguments[0])}`, 'red')
    }
    await addItem(ctx, item)
    return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you purchased ${ctx.boldName(ctx.arguments[0])} for ${ctx.boldName(ctx.fmtNum(cost))}${ctx.symbols.lemon} (actually 0 for testing)!`, 'deepgreen')
}