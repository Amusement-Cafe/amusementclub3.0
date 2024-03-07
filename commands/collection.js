const _ = require('lodash')

const {
    firstBy,
} = require("thenby")

const {
    cmd,
} = require('../utils/cmd')

const {
    propertySort,
} = require('../utils/tools')

const {
    getAllUserCards,
    getSpecificUserCards,
} = require("../modules/usercards")

const {
    withCards,
} = require("../modules/card")

const {
    resetCollection,
    resetNeeds,
} = require("../modules/collection")

cmd(['collection', 'list'], async (ctx, user, args) => await collectionList(ctx, user, args))

cmd(['collection', 'info'], async (ctx, user, args) => await collectionInfo(ctx, user, args))

cmd(['collection', 'reset'], async (ctx, user, args) => await collectionReset(ctx, user, args))

const collectionList = async (ctx, user, args) => {
    let cols = args.cols.length > 0? _.flattenDeep(args.cols): ctx.collections

    if (args.completed)
        cols = cols.filter(x => user.completedCols.some(y => y.id === x.id))
    else if (args.completed === false)
        cols = cols.filter(x => !user.completedCols.some(y => y.id === x.id))

    if (args.clouted)
        cols = cols.filter(x => user.cloutedCols.some(y => y.id === x.id))
    else if (args.clouted === false)
        cols = cols.filter(x => !user.cloutedCols.some(y => y.id === x.id))

    if (cols.length === 0)
        return ctx.reply(user, `no collections found!`, 'red')

    cols.sort((a, b) => propertySort(a, b, "id"))

    const userCards = await getAllUserCards(user, true)
    const colList = cols.map(x => {
        const userOwned = userCards.filter(card => ctx.cards[card.cardID]?.col === x.id).length
        const allCollectionCards = ctx.cards.filter(cards => cards.col === x.id).length
        return {
            name: x.name,
            collectionID: x.id,
            clouted: user.cloutedCols? user.cloutedCols.find(y => y.id === x.id)?.amount: 0,
            allCards: allCollectionCards,
            userOwned: userOwned,
            percentage: ((userOwned / allCollectionCards) * 100).toPrecision(3)
        }
    })

    if (args.sortComplete)
        colList.sort(firstBy((a, b) => b.percentage - a.percentage).thenBy((c, d) => d.userOwned - c.userOwned).thenBy((e, f) => e.name - f.name))
    else if (args.sortComplete === false)
        colList.sort(firstBy((a, b) => a.percentage - b.percentage).thenBy((c, d) => c.userOwned - d.userOwned).thenBy((e, f) => e.name - f.name))

    const pages = ctx.makePages(colList.map(x => {
        const cloutStars = x.clouted > 0? `[${x.clouted}${ctx.symbols.star}] `: ''
        const percText = x.percentage > 0? x.percentage < 1? '(<1%)': `(${x.percentage}%)`: ''
        const countText = x.percentage >= 100? '': `[${x.userOwned}/${x.allCards}]`
        return `${cloutStars}**${x.name}** \`${x.collectionID}\` ${percText} ${countText}`
    }), 15)

    return ctx.sendInteraction(ctx, user, {
        pages,
        pgnButtons: ["back", "next"],
        embed: {
            author: { name: `found ${cols.length} collections` }
        }
    })
}

//To-do Once meta is in
const collectionInfo = async (ctx, user, args) => {
    const col = _.flattenDeep(args.cols)[0]

    if (!col)
        return ctx.reply(user, `found 0 collections matching \`${args.colQuery}\``, 'red')

    const collectionCards = ctx.cards.filter(x => x.col === col.id)
    const userCards = await getSpecificUserCards(user, collectionCards.map(x => x.id), true)
    const sampleCard = _.sample(collectionCards)

    return ctx.reply(user, `there will be info about **${col.name}** here later`)
}

const collectionReset = withCards(async (ctx, user, args, cards) => {
    const col = _.flattenDeep(args.cols)[0]

    if (!col)
        return ctx.reply(user, `found 0 collections matching \`${args.colQuery}\``, 'red')

    const collectionCards = ctx.cards.filter(x => x.col === col.id && x.level < 5)
    const userCards = cards.filter(x => ctx.cards[x.cardID].col === col.id)
    const neededForReset = resetNeeds(collectionCards)

    let missing
    let response = []

    if (neededForReset[4] > 0) {
        const fourStars = userCards.filter(x => x.level === 4 && (x.fav? x.amount > 1: x.amount > 0)).length
        const has4 =  fourStars >= neededForReset[4]
        response.push(`★★★★: **${neededForReset[4]}** ${has4? '' : `- You have **${fourStars}/${neededForReset[4]}** (${neededForReset[4] - fourStars} remaining)`}`)
        if (!has4)
            missing = true
    }
    if (neededForReset[3] > 0) {
        const threeStars = userCards.filter(x => x.level === 3 && (x.fav? x.amount > 1: x.amount > 0)).length
        const has3 =  threeStars >= neededForReset[3]
        response.push(`★★★: **${neededForReset[3]}** ${has3? '' : `- You have **${threeStars}/${neededForReset[3]}** (${neededForReset[3] - threeStars} remaining)`}`)
        if (!has3)
            missing = true
    }
    if (neededForReset[2] > 0) {
        const twoStars = userCards.filter(x => x.level === 2 && (x.fav? x.amount > 1: x.amount > 0)).length
        const has2 =  twoStars >= neededForReset[2]
        response.push(`★★: **${neededForReset[2]}** ${has2? '' : `- You have **${twoStars}/${neededForReset[2]}** (${neededForReset[2] - twoStars} remaining)`}`)
        if (!has2)
            missing = true
    }
    if (neededForReset[1] > 0) {
        const oneStars = userCards.filter(x => x.level === 1 && (x.fav? x.amount > 1: x.amount > 0)).length
        const has1 =  oneStars >= neededForReset[1]
        response.push(`★: **${neededForReset[1]}** ${has1? '' : `- You have **${oneStars}/${neededForReset[1]}** (${neededForReset[1] - oneStars} remaining)`}`)
        if (!has1)
            missing = true
    }

    if (missing)
        return ctx.reply(user, `you have to have **100%** of the required card rarities to reset the collection **${col.name}** (\`${col.id}\`)!
        Unique cards needed for this collection reset are as follows:\n${response.join('\n')}\n***This count excludes single cards that are favorited***.`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `Are you sure you want to reset **${col.name}**?
            This will take at random the following card rarities and amounts:
            ${response.join('\n')}
            You will get a clout star ${ctx.cards.find(x => x.col === col.id && x.level === 5)?
            `and legendary claim ticket for resetting this collection`: `for resetting this collection\n> Please be aware that you will not receive a legendary claim ticket as this collection does not have any legendaries!`}`
        },
        onConfirm: () => resetCollection()
    })

})