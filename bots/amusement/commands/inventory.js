const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    getUserInventory
} = require('../helpers/userInventory')

const {
    Button,
    Selection
} = require('../helpers/componentBuilders')

const menus = require('../static/menus/inventory/inventory.json')

const homeButton = new Button('inv_home').setLabel('Home Page').setStyle(2)

registerBotCommand(['inventory'], async (ctx) => await inventoryStart(ctx))

registerReaction(['inventoryMain'], async (ctx) => await mainSelect(ctx))
registerReaction(['inventoryItem'], async (ctx) => await itemSelect(ctx))
registerReaction(['inv', 'home'], async (ctx) => await inventoryStart(ctx, true))

const inventoryStart = async (ctx, back = false) => {
    const inv = await getUserInventory(ctx)
    const start = menus.all.filter(x => inv.some(y => y.type === x.value))
    const menu = new Selection('inventoryMain').setOptions(start)

    if (start.length === 0) {
        return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, you have no items in your inventory to display! You can buy them in the \`/store\`.`, 'red')
    }
    return await ctx.send(ctx, {
        selection: [menu],
        embed: {
            description: 'Test'
        },
        parent: back
    })
}

const mainSelect = async (ctx) => {
    let inv = await getUserInventory(ctx)
    const type = ctx.arguments[0]
    inv = inv.filter(x => x.type === type)
    if (inv.length === 0) {
        return ctx.send(ctx, `something went wrong`, 'red')
    }
    const selects = menus[type].filter(x => inv.some(y => x.value === y.itemID))
    const selection = new Selection(`inventoryItem`).setOptions(selects)

    return ctx.send(ctx, {
        embed: {
            description: `Not tired anymore, no embed ideas though`,
            color: ctx.colors.deepgreen
        },
        selection: [selection],
        customButtons: [homeButton],
        parent: true
    })
}

const itemSelect = async (ctx) => {
    let inv = await getUserInventory(ctx)
    const item = ctx.arguments[0]
    inv = inv.filter(x => item === x.itemID)
    if (inv.length === 0) {
        return ctx.send(ctx, `something went wrong`, 'red')
    }
    return ctx.send(ctx, {
        embed: {
            description: `This is an embed for ${item}. You have ${ctx.boldName(inv.length)} of them.`,
            color: ctx.colors.deepgreen
        },
        customButtons: [homeButton],
        parent: true
    })
}


const ticketSelect = async (ctx) => {}

const blueprintSelect = async (ctx) => {}

const recipeSelect = async (ctx) => {}

const bonusSelect = async (ctx) => {}