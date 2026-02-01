const _ = require('lodash')

const {
    registerBotCommand,
    registerReaction
} = require('../../../utils/commandRegistrar')

const {
    Button
} = require('../helpers/componentBuilders')

const {
    generateNewID
} = require("../../../utils/misc")

const {
    fetchUser,
} = require("../helpers/user")

let collectionPages = []

registerBotCommand(['collections'], async (ctx) => await listCollections(ctx))

registerReaction(['col', 'list'], async (ctx) => listCollectionPages(ctx))
registerReaction(['col', 'info'], async (ctx) => listCollectionInfos(ctx), {withCards: true})


const listCollections = async (ctx) => {
    invalidateCollectionPages(ctx)

    const uniqueID = generateNewID()

    let colList = ctx.args.cols.length? ctx.args.cols: [...ctx.collections]
    colList.sort((a, b) => a.collectionID.localeCompare(b.collectionID))

    const customPgnButtons = []
    const pages = ctx.getPages(colList.map(x => `[${x.stars[0]}] ${ctx.boldName(x.name)} \`${x.collectionID}\``))

    const buttonID = uniqueID.replaceAll(/-/g, "O")
    if (pages.length > 1) {
        customPgnButtons.push(new Button(`col_list-${buttonID}-last`).setStyle(1).setLabel('Back'))
        customPgnButtons.push(new Button(`col_list-${buttonID}-1`).setStyle(1).setLabel('Next'))
    }

    const customButtons = []
    customButtons.push(new Button(`col_info-${buttonID}-0`).setStyle(2).setLabel('Show Info'))

    let message = await ctx.send(ctx, {
        pages,
        embed: {
            title: `Found ${colList.length} collections`,
            description: ' '
        },
        customPgnButtons,
        customButtons
    })
    collectionPages.push({listPages: pages, lastListPage: 0, infoPages: [], collectionList: colList, userID: ctx.user.userID, lastUsed: new Date(), uniqueID, messageID: message.message.id, buttonID})
}

const listCollectionPages = async (ctx) => {
    const {entry, index} = getActivePages(ctx)
    if (!entry) {
        return removeCollectionButtons(ctx)
    }
    entry.lastUsed = new Date()
    let page = ctx.arguments[1]
    page = page === 'first'? 0: page === 'last'? entry.listPages.length - 1: Number(page)

    if (ctx.arguments[2]) {
        page = entry.lastListPage
    }

    const nextPage = page + 1 >= entry.listPages.length? 'first': page + 1
    const backPage = page - 1 < 0? 'last' : page - 1
    const customPgnButtons = []
    const customButtons = []

    customPgnButtons.push(new Button(`col_list-${entry.buttonID}-${backPage}`).setLabel('Back').setStyle(1))
    customPgnButtons.push(new Button(`col_list-${entry.buttonID}-${nextPage}`).setLabel('Next').setStyle(1))
    customButtons.push(new Button(`col_info-${entry.buttonID}-${page * 10}`).setStyle(2).setLabel('Show Info'))

    entry.lastListPage = page

    let pages = [...entry.listPages]
    if (page !== -1) {
        const [removedItem] = pages.splice(page, 1)
        pages.unshift(removedItem)
    }

    return ctx.send(ctx, {
        pages,
        embed: {
            title: `Found ${entry.collectionList.length} collections`,
            description: 'Processing...',
            footer: {
                text: `Page ${page + 1}/${entry.listPages.length}`,
            }
        },
        parent: true,
        customPgnButtons,
        customButtons
    })

}

const listCollectionInfos = async (ctx) => {
    const {entry, index} = getActivePages(ctx)
    if (!entry) {
        return removeCollectionButtons(ctx)
    }
    if (!entry.infoPages.length) {
        let infoPages = []
        await Promise.all(entry.collectionList.map(async (x, i) => {
            let embed = {}
            let colCards = ctx.cards.filter(y => y.collectionID === x.collectionID)
            let userOwned = ctx.userCards.filter(y => y.collectionID === x.collectionID).length
            const displayCard = _.sample(colCards)
            const ratingAverage = colCards.reduce((acc, cur) => acc + cur.ratingSum, 0) / colCards.reduce((acc, cur) => acc + cur.timesRated, 0)
            embed.title = x.name
            embed.description = `Overall cards: ${ctx.boldName(ctx.fmtNum(colCards.length))}\n`
            embed.description += `You have: ${ctx.boldName(ctx.fmtNum(userOwned))}/${ctx.boldName(ctx.fmtNum(colCards.length))}\n`
            if (x.stars[0] !== '★') {
                embed.description += `Custom Star: ${x.stars[0]}\n`
            }
            // embed.description += `Average Rating: ${ctx.boldName(ctx.fmtNum(ratingAverage.toFixed(2)))}\n`
            embed.description += `Added: ${ctx.boldName(new Date(x.dateAdded).toDateString())} (~${ctx.timeDisplay(ctx, x.dateAdded)})\n`
            if (x.creatorID) {
                let creator = await fetchUser(x.creatorID)
                creator? embed.description += `Template author: ${creator.username}\n`: false
            }
            // embed.description += `Your clout: N/A atm\n`
            embed.description += `Aliases: ${ctx.boldName(x.aliases.join(' **|** '))}\n`
            embed.description += `[More information about this fandom](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n`
            embed.description += `Sample Card: ${ctx.formatName(ctx, displayCard)}\n`
            embed.image = {url: displayCard.cardURL}
            embed.footer = {text: `Page ${i+1}/${entry.collectionList.length}`}
            infoPages[i] = embed
        }))
        entry.infoPages = infoPages
    }
    entry.lastUsed = new Date()

    let page = ctx.arguments[1]
    page = page === 'first'? 0: page === 'last'? entry.infoPages.length - 1: Number(page)

    if (ctx.arguments[2]) {
        page = entry.lastListPage
    }

    const nextPage = page + 1 >= entry.infoPages.length? 'first': page + 1
    const backPage = page - 1 < 0? 'last' : page - 1
    const customPgnButtons = []
    const customButtons = []

    customPgnButtons.push(new Button(`col_info-${entry.buttonID}-${backPage}`).setLabel('Back').setStyle(1))
    customPgnButtons.push(new Button(`col_info-${entry.buttonID}-${nextPage}`).setLabel('Next').setStyle(1))
    customButtons.push(new Button(`col_list-${entry.buttonID}-${entry.lastListPage}`).setStyle(2).setLabel('Show List'))

    let pages = [...entry.infoPages]
    if (page !== -1) {
        const [removedItem] = pages.splice(page, 1)
        pages.unshift(removedItem)
    }

    return ctx.send(ctx, {
        pages,
        switchPage: (data) => data.embed = data.pages[data.pageNum],
        embed: entry.infoPages[0],
        parent: true,
        customPgnButtons,
        customButtons
    })
}

const invalidateCollectionPages = (ctx) => collectionPages = collectionPages.filter(x => ctx.user.userID !== x.userID)
const timeoutCollectionPages = () => setInterval(() => collectionPages = collectionPages.filter(x => (5 * 60 * 1000 + new Date(x.lastUsed).getTime()) >= new Date().getTime()), 60000)

const removeCollectionButtons = async (ctx) => {
    await ctx.send(ctx, {
        embed: ctx.interaction.message.embeds[0],
        parent: true
    })
    return ctx.interaction.channel.createMessage({
        embeds: [
            {
                description: `The collections list you have attempted to interact with has expired. They expire after 5 minutes of inactivity or after a bot restart/secondary command. Please run the command again!`,
                color: ctx.colors.red
            }
        ],
        messageReference: {messageID: ctx.interaction.message.id}
    })
}

const getActivePages = (ctx) => {
    let index = collectionPages.findIndex(x => ctx.arguments[0].replaceAll(/O/g, "-") === x.uniqueID)
    if (index < 0) {
        return false
    }
    let entry = collectionPages[index]
    return {entry, index}
}

timeoutCollectionPages()