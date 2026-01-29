const {registerBotCommand} = require('../../../utils/commandRegistrar')
const _ = require('lodash')

const {
    fetchUser
} = require("../helpers/user")

registerBotCommand('summon', async (ctx) => await summonCard(ctx), {withCards: true})

registerBotCommand('info', async (ctx) => await cardInfo(ctx))


const summonCard = async (ctx) => {
    if (ctx.userCards.length === 0) {
        return ctx.send(ctx, `There are no cards found with your query to summon, or you have no cards to summon!`, 'red')
    }
    ctx.args.fmtOptions.amount = false
    const cardToDisplay = _.sample(ctx.userCards)
    return ctx.send(ctx, {
        embed: {
            description: `${ctx.boldName(ctx.user.username)} summons ${ctx.formatName(ctx, cardToDisplay)}!`,
            image: {
                url: cardToDisplay.cardURL
            }
        }
    })
}

const cardInfo = async (ctx) => {
    if (!ctx.globalCards.length) {
        return ctx.send(ctx, `No cards found matching your query \`${ctx.options.card_query}\`. Please check your query and try again!`, 'red')
    }
    const card = ctx.globalCards[0]
    const col = ctx.collections.find(x => x.collectionID === card.collectionID)
    const userCard = ctx.userCards.find(x => x.cardID === card.cardID)
    const embed = { color: ctx.colors.blue, fields: [] }
    let response = []
    response.push(ctx.formatName(ctx, card))
    response.push(`Fandom: ${ctx.boldName(col.name)}`)
    response.push(`Price: ${ctx.boldName(ctx.fmtNum(card.eval))}${ctx.symbols.tomato}`)

    if (card.ratingSum) {
        response.push(`Average Rating: ${ctx.boldName((card.ratingSum / card.timesRated).toFixed(2))}`)
    }

    if (userCard && userCard.rating) {
        response.push(`Your Rating: ${ctx.boldName(userCard.rating)}`)
    }

    if (card.ownerCount > 0) {
        response.push(`Owner Count: ${ctx.boldName(ctx.fmtNum(card.ownerCount))}`)
    }

    if (card.stats.totalCopies) {
        response.push(`Total Copies: ${ctx.boldName(ctx.fmtNum(card.stats.totalCopies))}`)
    }

    if (card.stats.auctionCount > 0) {
        response.push(`Auction Count: ${ctx.boldName(ctx.fmtNum(card.stats.auctionCount))}`)
        if (card.stats.auctionSales.length > 0) {
            response.push(`Last 3 Auction Prices: ${card.stats.auctionSales.map(x => `${ctx.boldName(ctx.fmtNum(x.cost))}${ctx.symbols.tomato}`).join(' ')}`)
        }
    }

    response.push(`CardID: ${ctx.boldName(card.cardID)}`)
    embed.description = response.join('\n')

    //Todo add tags

    if (card.meta) {
        const metaInfo = []
        if (card.meta.booruID) {
            metaInfo.push(`Rating: ${ctx.boldName(card.meta.booruRating)}`)
            metaInfo.push(`Artist: ${ctx.boldName(card.meta.artist)}`)
            metaInfo.push(`[Danbooru page](https://danbooru.donmai.us/posts/${card.meta.booruID})`)
        }

        if (card.meta.userID) {
            const cardCreator = await fetchUser(card.meta.userID)
            metaInfo.push(`Card Created By: ${ctx.boldName(cardCreator.username)}`)
        }

        if (card.added) {
            metaInfo.push(`Card Added: ${ctx.boldName(`<t:${Math.round(((new Date(card.added).getTime()) / 1000))}:F>`)}`)
        }

        if (metaInfo.length) {
            embed.fields.push({
                name: `Metadata`,
                value: metaInfo.join('\n'),
                inline: true
            })
        }
    }

    if (card.meta?.source) {
        const sourceInfo = []

        // Yes this is a nonsense item right now, I forgot about imgur links for the HD legendaries which would be an || for the above if
        if (card.meta?.source) {
            if (card.meta.source.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/=]*)/)) {
                sourceInfo.push(`[Image Origin](${card.meta.source})`)
            } else {
                sourceInfo.push(`This card is a screen capture or snippet from an anime or game.`)
            }
        }

        if (card.meta?.image) {
            sourceInfo.push(`[Source Image](${card.meta.image})`)
        }

        if (card.meta?.contributor) {
            const contrib = await fetchUser(card.meta.contributor)
            sourceInfo.push(`Source Researched By: ${ctx.boldName(contrib.username)}`)
        }

        if (sourceInfo.length) {
            embed.fields.push({
                name: `Links`,
                value: sourceInfo.join('\n'),
            })
        }
    }
    embed.image = {url: card.cardURL}
    return ctx.send(ctx, {
        embed
    })
}