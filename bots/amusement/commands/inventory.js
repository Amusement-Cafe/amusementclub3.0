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
registerReaction(['ticket', 'page'], async (ctx) => await ticketPage(ctx))

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
    const selects = menus[type].filter(x => inv.some(y => x.value.split('-')[0] === y.itemID))
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
    inv = inv.filter(x => item.split('-')[0] === x.itemID)
    if (inv.length === 0) {
        return ctx.send(ctx, `something went wrong`, 'red')
    }
    switch (item.split('-')[1]) {
        case 'ticket':
            return await ticketSelect(ctx, inv)
        case 'bonus':
        case 'building':
        case 'recipe':
            break
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


const ticketSelect = async (ctx, inv) => {
    const item = ctx.items[ctx.arguments[0].split('-')[0]]
    let invItems = inv.reduce((acc, current) => {
        const exists = acc.find(item => item.collectionID === current.collectionID)
        if (!exists) {
            return acc.concat([current])
        } else {
            return acc
        }
    }, [])
    let buttons = [homeButton]
    let pgnButtons = []
    if (invItems.length > 1) {
        pgnButtons.push(new Button(`ticket_page-1-${item.itemID}-${item.type}`).setLabel('Next').setStyle(1))
        if (invItems.length > 2){
            pgnButtons.push(new Button(`ticket_page-${invItems.length - 1}-${item.itemID}-${item.type}`).setLabel('Last').setStyle(1))
        }
    }


    return ctx.send(ctx, {
        pages: invItems.map(x => x.collectionID || 'random'),
        embed: {
            title: ctx.items[invItems[0].itemID].itemID,
            description: invItems[0].collectionID? invItems[0].collectionID: 'random'
        },
        customPgnButtons: pgnButtons.length !== 0? pgnButtons: false,
        customButtons: buttons,
        parent: true
    })
}

const ticketPage = async (ctx) => {
    let page = Number(ctx.arguments.shift())

    let itemID = ctx.arguments.shift()
    let type = ctx.arguments.shift()
    let inv = await getUserInventory(ctx, type)
    inv = inv.filter(x => x.itemID === itemID)
    let invItems = inv.reduce((acc, current) => {
        const exists = acc.find(item => item.collectionID === current.collectionID)
        if (!exists) {
            return acc.concat([current])
        } else {
            return acc
        }
    }, [])
    if (page < 0) {
        page = invItems.length - 1
    }
    if (page > invItems.length - 1) {
        page = 0
    }
    let filteredItem = invItems[page]
    let pages = invItems.map(x => x.collectionID || 'random')
    let index = pages.findIndex(item => filteredItem.collectionID === item)
    if (index !== -1) {
        const [removedItem] = pages.splice(index, 1)
        pages.unshift(removedItem)
    }
    let pgnButtons = []
    if (invItems.length > 1) {
        pgnButtons.push(new Button(`ticket_page-${page - 1 < 0? invItems.length - 1: page - 1}-${itemID}-${type}`).setLabel('Back').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-${page + 1}-${itemID}-${type}`).setLabel('Next').setStyle(1))
        if (page > 1) {
            pgnButtons.push(new Button(`ticket_page-0-${itemID}-${type}`).setLabel('First').setStyle(1))
        }
        if (page !== invItems.length - 2 && page !== invItems.length - 1 && page !== 0) {
            pgnButtons.push(new Button(`ticket_page-${invItems.length - 1}-${itemID}-${type}`).setLabel('Last').setStyle(1))
        }
    }
    return ctx.send(ctx, {
        pages: pages,
        embed: {
            title: ctx.items[invItems[0].itemID].itemID,
            description: pages[0],
            footer: {
                text: `Page ${page+1}/${invItems.length}`,
            }
        },
        parent: true,
        customButtons: [homeButton],
        customPgnButtons: pgnButtons
    })
}

const blueprintSelect = async (ctx) => {}

const recipeSelect = async (ctx) => {}

const bonusSelect = async (ctx) => {}