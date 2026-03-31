const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {generateGlobalCommand} = require("../../../utils/commandGeneration")
const UserCards = require('../../../db/userCard')

registerBotCommand(['fav', 'one'], async (ctx) => await fav(ctx), {withCards: true})
registerBotCommand(['fav', 'many'], async (ctx) => await fav(ctx, true), {withCards: true})
registerBotCommand(['fav', 'remove', 'one'], async (ctx) => await fav(ctx, false, true), {withCards: true})
registerBotCommand(['fav', 'remove', 'many'], async (ctx) => await fav(ctx, true, true), {withCards: true})
generateGlobalCommand('fav', 'Top Level Fav')
    .subCommand('one', 'Favorite a single card')
    .cardQuery()
    .required()
    .close()
    .subCommand('many', 'Favorite multiple cards at once')
    .cardQuery()
    .close()
    .subCommandGroup('remove', 'Top Level Remove')
    .subCommand('one', 'Remove a single card from you favorite list')
    .cardQuery()
    .required()
    .close()
    .subCommand('many', 'Remove multiple cards from your favorite list')
    .cardQuery()
    .close()
    .close()

registerBotCommand(['lock', 'one'], async (ctx) => await lock(ctx), {withCards: true})
registerBotCommand(['lock', 'many'], async (ctx) => await lock(ctx, true), {withCards: true})
registerBotCommand(['lock', 'remove', 'one'], async (ctx) => await lock(ctx, false, true), {withCards: true})
registerBotCommand(['lock', 'remove', 'many'], async (ctx) => await lock(ctx, true, true), {withCards: true})
generateGlobalCommand('lock', 'Top Level Lock')
    .subCommand('one', 'Lock a single card')
    .cardQuery()
    .required()
    .close()
    .subCommand('many', 'Lock multiple cards at once')
    .cardQuery()
    .close()
    .subCommandGroup('remove', 'Top Level Remove')
    .subCommand('one', 'Remove a single card from your lock list')
    .cardQuery()
    .required()
    .close()
    .subCommand('many', 'Remove multiple cards from your lock list')
    .cardQuery()
    .close()
    .close()

const fav = async (ctx, many = false, remove = false) => {
    if (!ctx.userCards.length) {
        return ctx.send(ctx, `No cards found matching your query! Please try your command again.`, 'red')
    }

    let nonFav = ctx.userCards.filter(x => remove? x.fav: !x.fav)
    if (!nonFav.length) {
        return ctx.send(ctx, `All cards matching this query are ${remove? 'not marked as favorite already': `already marked as favorite`}!`, 'red')
    }

    let selection = many? nonFav: [nonFav[0]]
    let pages = selection.map(x => ctx.formatName(ctx, x))
    return ctx.send(ctx, {
        pages: ctx.getPages(pages),
        embed: {
            title: `${ctx.user.username}, you are about to ${remove? 'remove': 'favorite'} ${selection.length === 1? selection[0].displayName: `${ctx.fmtNum(selection.length)} cards`}${remove? ' from your favorites': ''}`
        },
        confirmation: true,
        onConfirm: () => favOrUnfav(ctx, selection.map(x => x.cardID), remove),
    })
}

const lock = async (ctx, many = false, remove = false) => {
    if (!ctx.userCards.length) {
        return ctx.send(ctx, `No cards found matching your query! Please try your command again.`, 'red')
    }

    let nonFav = ctx.userCards.filter(x => remove? x.locked: !x.locked)
    if (!nonFav.length) {
        return ctx.send(ctx, `All cards matching this query are ${remove? 'not marked as locked already': `already marked as locked`}!`, 'red')
    }

    let selection = many? nonFav: [nonFav[0]]
    let pages = selection.map(x => ctx.formatName(ctx, x))
    return ctx.send(ctx, {
        pages: ctx.getPages(pages),
        embed: {
            title: `${ctx.user.username}, you are about to ${remove? 'remove': 'lock'} ${selection.length === 1? selection[0].displayName: `${ctx.fmtNum(selection.length)} cards`}${remove? ' from your locked cards': ''}`
        },
        confirmation: true,
        onConfirm: () => lockOrUnlock(ctx, selection.map(x => x.cardID), remove),
    })
}

const favOrUnfav = async (ctx, cardIDs, remove = false) => {
    await UserCards.updateMany(
        {
            userID: ctx.user.userID,
            cardID: {$in: cardIDs}
        },
        {
            $set: {fav: !remove}
        }
    )
    return ctx.send(ctx, {
        embed: {
            color: ctx.colors.green,
            description: `You have ${remove? `removed`: 'marked'} ${cardIDs.length === 1? ctx.cards[cardIDs[0]].displayName: `${ctx.fmtNum(cardIDs.length)} card(s)`} ${remove ? 'from your favorite list' : 'as favorite'}`
        },
        edit: true
    })
}

const lockOrUnlock = async (ctx, cardIDs, remove = false) => {
    await UserCards.updateMany(
        {
            userID: ctx.user.userID,
            cardID: {$in: cardIDs}
        },
        {
            $set: {locked: !remove}
        }
    )
    return ctx.send(ctx, {
        embed: {
            color: ctx.colors.green,
            description: `You have ${remove? `removed`: 'locked'} ${cardIDs.length === 1? ctx.cards[cardIDs[0]].displayName: `${ctx.fmtNum(cardIDs.length)} card(s)`}${remove ? ' from your locked list' : ''}`
        },
        edit: true
    })
}