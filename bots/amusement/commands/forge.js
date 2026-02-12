const _ = require('lodash')

const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    Button,
} = require('../helpers/componentBuilders')

const {
    removeUserCards,
    addUserCards
} = require("../helpers/userCard")

let pricePerRarity = 250


registerBotCommand(['forge'], async (ctx) => await forge(ctx), {withCards: true})

registerReaction(['forge'], async (ctx) => await processForge(ctx), {withCards: true})

const forge = async (ctx) => {
    ctx.userCards[0] = ctx.userCards[0].filter(x => !x.locked)
    ctx.userCards[1] = ctx.userCards[1].filter(x => !x.locked)

    if (ctx.userCards[0].length === 0) {
        return ctx.send(ctx, `No cards found for query 1! Please try your query again.`, 'red')
    }

    if (ctx.userCards[1].length === 0) {
        return ctx.send(ctx, `No cards found for query 2! Please try your query again.`, 'red')
    }
    ctx.userCards = ctx.userCards.filter(x => x.length > 0)

    if (ctx.userCards.length < 2) {
        return ctx.send(ctx, `${ctx.boldName(ctx.user.username)}, something has gone wrong in card selection. Please try your command again!`, 'red')
    }

    let forge1 = ctx.userCards[0][0]
    let forge2 = ctx.userCards[1].filter(x => x.rarity === forge1.rarity && x.cardID !== forge1.cardID)

    if (!forge2.length) {
        return ctx.send(ctx, `Cannot find enough unique cards of the same rarity to forge! The only found card was ${ctx.formatName(ctx, forge1)}`, 'red')
    }
    forge2 = forge2[0]

    if (forge1.rarity !== forge2.rarity) {
        return ctx.send(ctx, `Both cards need to be the same rarity to forge!`, 'red')
    }
    if (forge1.rarity === 5 || forge2.rarity === 5) {
        return ctx.send(ctx, `You cannot forge legendary cards!`, 'red')
    }

    let cfmForge = new Button(`forge-${forge1.cardID}c${forge2.cardID}`).setLabel('Confirm').setStyle(3)
    let dclForge = new Button(`dcl`).setLabel('Decline').setStyle(4)

    return ctx.send(ctx, {
        embed: {
            description: `Do you want to forge ${ctx.formatName(ctx, forge1)} and ${ctx.formatName(ctx, forge2)}? This action will cost ${ctx.boldName(ctx.fmtNum(forge1.rarity * pricePerRarity))}${ctx.symbols.tomato}`,
            color: ctx.colors.yellow
        },
        customButtons: [cfmForge, dclForge],
        onDecline: () => {
            return ctx.send(ctx, {
                embed: {
                    description: `Forge process has been cancelled.`,
                    color: ctx.colors.red
                },
                edit: true
            })
        }
    })
}

const processForge = async (ctx) => {
    const cardIDs = ctx.arguments[0].split('c')
    let stillOwned = cardIDs.map(x => ctx.userCards.some(y => x == y.cardID))

    let card1 = ctx.cards.find(x => x.cardID == cardIDs[0])
    let card2 = ctx.cards.find(x => x.cardID == cardIDs[1])

    if (stillOwned.some(x => !x) || !card1 || !card2) {
        return ctx.send(ctx, {
            embed: {
                description: `Cannot find one of the cards from your forge! Please try your original command again.`,
                color: ctx.colors.red
            },
            parent: true
        })
    }

    let isPromo = ctx.collections.some(x => x.collectionID === card1.collectionID && card2.collectionID === x.collectionID && x.promo)
    let newCard = ctx.cards.filter(x => x.rarity === card1.rarity && (x.cardID !== card1.cardID && x.cardID !== card2.cardID)).filter(x => isPromo? !x.canDrop: x.canDrop)
    let cost = card1.rarity * pricePerRarity
    if (isPromo || card1.collectionID === card2.collectionID) {
        newCard = newCard.filter(x => x.collectionID === card1.collectionID)
    }

    newCard = _.sample(newCard)

    if (!newCard) {
        await ctx.interaction.defer(64)
        return ctx.send(ctx, `Something has gone wrong with this forge, a new card could not be found! Please try your forge again.`, 'red')
    }

    await ctx.updateStat(ctx, `forge`, 1)
    await ctx.updateStat(ctx, `forge${card1.rarity}`, 1)
    await ctx.updateStat(ctx, 'tomatoOut', cost)
    ctx.user.tomatoes -= cost
    await ctx.user.save()
    let alreadyOwned = ctx.userCards.find(x => x.cardID === newCard.cardID)

    await removeUserCards(ctx.user.userID, cardIDs)
    await addUserCards(ctx.user.userID, [newCard.cardID])
    ctx.args.fmtOptions.amount = false
    return ctx.send(ctx, {
        embed: {
            description: `${ctx.boldName(ctx.user.username)}, you got ${ctx.formatName(ctx, alreadyOwned? alreadyOwned: newCard)}!${alreadyOwned? '\n*You already own this card*': ''}`,
            color: ctx.colors.green,
            image: {
                url: newCard.cardURL,
            }
        },
        parent: true
    })

}