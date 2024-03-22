const {
    cmd,
    pcmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards
} = require('../modules/card')

const {
    evalCard,
} = require("../modules/eval")

const {
    bestColMatch,
} = require("../modules/collection")

const {
    getSpecificUserCards,
} = require("../modules/usercards")

const {
    fetchCardInfo
} = require('../modules/meta')

cmd('info', async (ctx, user, args) => await info(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'guess'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'scan'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'set', 'booru'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'metamod'], ['meta', 'set', 'source'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'meta command'})
}


const info = withCards(async (ctx, user, args, cards) => {
    const card = cards[0]
    const price = await evalCard(ctx, card)
    const cardCol = bestColMatch(ctx, card.collectionID)[0]
    const userCard = await getSpecificUserCards(user, [card.id], true)

    const response = []
    const embed = { color: ctx.colors.blue, fields: [] }

    response.push(formatCard(ctx, card))
    response.push(`Series: **${cardCol.name}**`)
    response.push(`Price: **${ctx.numFmt(price)}**${ctx.symbols.tomatoes}`)

    if (card.ratingSum > 0)
        response.push(`Average Rating: **${(card.ratingsum / card.usercount).toFixed(2)}**`)

    if (userCard && userCard.rating)
        response.push(`Your Rating: **${userCard.rating}**`)

    if (card.ownerCount > 0)
        response.push(`Owner Count: **${ctx.numFmt(card.ownerCount)}**`)

    if (card.stats.totalCopies > 1)
        response.push(`Total Copies: **${ctx.numFmt(card.stats.totalCopies)}**`)

    if (card.stats.auctionCount > 0)
        response.push(`Times Auctioned: **${ctx.numFmt(card.stats.auctionCount)}**`)

    response.push(`ID: \`${card.cardID}\``)
    embed.description = response.join('\n')

    return ctx.sendInteraction(ctx, user, {embed})
}, {global: true})