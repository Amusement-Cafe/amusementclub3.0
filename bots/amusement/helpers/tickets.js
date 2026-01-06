const {registerReaction} = require("../../../utils/commandRegistrar")
const {
    getUserInventory
} = require("./userInventory")

const {
    Button
} = require("./componentBuilders")
const homeButton = new Button('inv_home').setLabel('Home Page').setStyle(2)

registerReaction(['ticket', 'page'], async (ctx) => await ticketPage(ctx))
registerReaction(['ticket', 'redeem'], async (ctx) => await ticketRedemption(ctx))

const ticketPage = async (ctx) => {
    let buttons = [homeButton]
    let page = ctx.arguments.shift()
    let itemID = ctx.arguments.shift()
    let type = ctx.arguments.shift()

    let inv = await getUserInventory(ctx, type)
    inv = inv.filter(x => x.itemID === itemID)

    let invItems = ctx.deDuplicate(inv, 'collectionID')

    if (page === 'first' || page === 'last') {
        page = page === 'first'? 0: invItems.length - 1
    }
    page = Number(page)
    if (page < 0) {
        page = invItems.length - 1
    }
    if (page > invItems.length - 1) {
        page = 0
    }

    let filteredItem = invItems[page]
    let sameType = inv.filter(x => x.collectionID && x.collectionID === filteredItem.collectionID)

    let pages = invItems.map(x => x.collectionID || 'random')
    let index = pages.findIndex(item => filteredItem.collectionID === item)
    if (index !== -1) {
        const [removedItem] = pages.splice(index, 1)
        pages.unshift(removedItem)
    }
    pages = pages.map(x => {
        let amount = 0
        inv.map(y => {
            if (!y.collectionID && x === 'random') {
                amount += 1
            } else if (y.collectionID === x) {
                amount += 1
            }
        })
        return `${x}${amount > 1? ` (x${amount})`: ``}`
    })


    let pgnButtons = []
    if (invItems.length > 1) {
        pgnButtons.push(new Button(`ticket_page-first-${itemID}-${type}`).setLabel('First').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-${page - 1 < 0? invItems.length - 1: page - 1}-${itemID}-${type}`).setLabel('Back').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-${page + 1}-${itemID}-${type}`).setLabel('Next').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-last-${itemID}-${type}`).setLabel('Last').setStyle(1))
    }
    buttons.push(
        new Button(`ticket_redeem-${invItems[index].id.replaceAll('-', 'O')}`).setLabel('Redeem Ticket').setStyle(3)
    )
    return ctx.send(ctx, {
        pages: pages,
        embed: {
            title: ctx.items[invItems[0].itemID].itemID,
            description: pages[0] + `${sameType.length > 1? ` (x${sameType.length})`: ``}`,
            footer: {
                text: `Page ${page+1}/${invItems.length}`,
            }
        },
        parent: true,
        customButtons: buttons,
        customPgnButtons: pgnButtons
    })
}

const ticketSelect = async (ctx, inv) => {
    const item = ctx.items[ctx.arguments[0].split('-')[0]]
    let invItems = ctx.deDuplicate(inv, 'collectionID')
    let buttons = [homeButton]
    let pgnButtons = []

    if (invItems.length > 1) {
        pgnButtons.push(new Button(`ticket_page-first-${item.itemID}-${item.type}`).setLabel('First').setStyle(1))

        if (invItems.length > 2){
            pgnButtons.push(new Button(`ticket_page-${invItems.length - 1}-${item.itemID}-${item.type}`).setLabel('Back').setStyle(1))
        }
        pgnButtons.push(new Button(`ticket_page-1-${item.itemID}-${item.type}`).setLabel('Next').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-last-${item.itemID}-${item.type}`).setLabel('Last').setStyle(1))

    }
    let sameType = inv.filter(x => {
        if (!x.collectionID && !invItems[0].collectionID) {
            return x.itemID === invItems[0].itemID
        }
        return x.itemID === invItems[0].itemID && x.collectionID === invItems[0].collectionID
    })
    let pages = invItems.map(x => x.collectionID || 'random')
    pages = pages.map(x => {
        let amount = 0
        inv.map(y => {
            if (!y.collectionID && x === 'random') {
                amount += 1
            } else if (y.collectionID === x) {
                amount += 1
            }
        })
        return `${x}${amount > 1? ` (x${amount})`: ``}`
    })

    buttons.push(
        new Button(`ticket_redeem-${invItems[0].id.replaceAll('-', 'O')}`).setLabel('Redeem Ticket').setStyle(3)
    )

    return ctx.send(ctx, {
        pages: pages,
        embed: {
            title: ctx.items[invItems[0].itemID].itemID,
            description: invItems[0].collectionID? invItems[0].collectionID: 'random' + `${sameType.length > 1? ` (x${sameType.length})`: ``}`
        },
        customPgnButtons: pgnButtons.length !== 0? pgnButtons: false,
        customButtons: buttons,
        parent: true
    })
}


const ticketRedemption = async (ctx) => {
    console.log(ctx.arguments)
}

module.exports = {
    ticketSelect
}