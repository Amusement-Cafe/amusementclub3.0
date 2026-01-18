const {registerReaction} = require("../../../utils/commandRegistrar")
const _ = require('lodash')

const {
    getUserInventory,
    removeItem,
} = require("./userInventory")

const {
    Button
} = require("./componentBuilders")

const {
    addUserCards
} = require("./userCard")

const invMain = require("../commands/inventory")

const homeButton = new Button('inv_home').setLabel('Home Page').setStyle(2)

registerReaction(['ticket', 'page'], async (ctx) => await ticketPage(ctx))
registerReaction(['ticket', 'redeem'], async (ctx) => await ticketRedemption(ctx))
registerReaction(['claimed', 'pages'], async (ctx) => await ticketPages(ctx))

const ticketPage = async (ctx) => {
    let buttons = [homeButton]
    let page = ctx.arguments.shift()
    let itemID = ctx.arguments.shift()
    let type = ctx.arguments.shift()

    let inv = await getUserInventory(ctx, type)
    inv = inv.filter(x => x.itemID === itemID)

    let invItems = ctx.deDuplicate(inv, 'collectionID').sort((a, b) => a.collectionID.localeCompare(b.collectionID))
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
    } else {
        index = 0
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
    if (pages.length === 0) {
        return await invMain.Home(ctx, true)
    }

    let pgnButtons = []
    if (invItems.length > 1) {
        pgnButtons.push(new Button(`ticket_page-first-${itemID}-${type}`).setLabel('First').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-${page - 1 < 0? invItems.length - 1: page - 1}-${itemID}-${type}`).setLabel('Back').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-${page + 1}-${itemID}-${type}`).setLabel('Next').setStyle(1))
        pgnButtons.push(new Button(`ticket_page-last-${itemID}-${type}`).setLabel('Last').setStyle(1))
    }
    buttons.push(
        new Button(`ticket_redeem-${index}-${invItems[index].id.replaceAll('-', 'O')}`).setLabel('Redeem Ticket').setStyle(3)
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
    let invItems = ctx.deDuplicate(inv, 'collectionID').sort((a, b) => a.collectionID.localeCompare(b.collectionID))
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
        new Button(`ticket_redeem-first-${invItems[0].id.replaceAll('-', 'O')}`).setLabel('Redeem Ticket').setStyle(3)
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
    let item = await getUserInventory(ctx, 'ticket')
    item = item.filter(x => x.id === ctx.arguments[1].replaceAll('O', '-'))
    if (item.length === 0) {
        return
    }
    item = item.shift()
    ctx.arguments = [ctx.arguments[0], item.itemID, item.type]
    let collection = item.collectionID? ctx.collections.filter(x => x.collectionID === item.collectionID)[0]: 'random'
    let itemIDSplit = item.itemID.substring(6).split('x')
    itemIDSplit[1] = itemIDSplit[1].substring(0, 1)
    let count = Number(itemIDSplit[0])
    let rarity = Number(itemIDSplit[1])
    let addedCards = []
    let newCollection
    while (addedCards.length < count) {
        if (collection === 'random') {
            newCollection = _.sample(ctx.collections.filter(x => x.inClaimPool))
        } else {
            newCollection = collection
        }
        let cardPool = ctx.cards.filter(x => x.collectionID === newCollection.collectionID && x.rarity === rarity)
        if (cardPool.length > 0) {
            addedCards.push(_.sample(cardPool))
        }
    }
    let addedIDList = addedCards.map(x => x.cardID)
    await addUserCards(ctx.user.userID, addedIDList)
    await removeItem(ctx, item)
    let components = []
    if (addedIDList.length > 1) {
        let nextPage = new Button(`claimed_pages-1-${addedIDList.join('-')}`).setLabel('Next').setStyle(1)
        let lastPage = new Button(`claimed_pages-2-${addedIDList.join('-')}`).setLabel('Back').setStyle(1)
        components = [
            {
                type: 1,
                components: [lastPage, nextPage]
            }
        ]
    }

    await ctx.interaction.channel.createMessage({
        embeds: [
            {
                description: `${ctx.boldName(ctx.user.username)}, you used a ${ctx.boldName(ctx.items[item.itemID].displayName)} and got \n${addedCards.map(x => ctx.formatName(ctx, x)).join('\n')}!`,
                color: ctx.colors.deepgreen,
                image: {url: addedCards[0].cardURL},
                footer: addedIDList.length > 1? {text: `Page 1/${addedIDList.length}`}: undefined
            }
        ],
        components: components,
        messageReference: {messageID: ctx.interaction.message.id}
    })
    return await ticketPage(ctx)
}

const ticketPages = async (ctx) => {
    let page = Number(ctx.arguments.shift())
    let card = ctx.cards.filter(x => x.cardID === Number(ctx.arguments[page]))[0]
    let backNum = page - 1 < 0? ctx.arguments.length - 1: page - 1
    let nextNum = page + 1 > ctx.arguments.length - 1? 0: page + 1
    let nextPage = new Button(`claimed_pages-${nextNum}-${ctx.arguments.join('-')}`).setLabel('Next').setStyle(1)
    let backPage = new Button(`claimed_pages-${backNum}-${ctx.arguments.join('-')}`).setLabel('Back').setStyle(1)
    let embed = ctx.interaction.message.embeds[0]
    if (!embed.image) {
        embed.image = {url: null}
    }
    embed.image.url = card.cardURL
    embed.footer.text = `Page ${page+1}/${ctx.arguments.length}`
    await ctx.send(ctx, {
        embed: embed,
        customButtons: [backPage, nextPage],
        parent: true
    })
}

module.exports = {
    ticketSelect
}