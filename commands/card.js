const _ = require("lodash")

const {
    cmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards,
} = require("../modules/card")

cmd('summon', async (ctx, user, args) => await summon(ctx, user, args))

cmd('cards', async (ctx, user, args) => await cards(ctx, user, args))

cmd(['cards', 'global'], async (ctx, user, args) => await globalCards(ctx, user, args))

const summon = withCards(async (ctx, user, args, cards) => {
    const card = _.sample(cards)

    if (card.imgur) {
        await ctx.reply(user, `summons **${formatCard(ctx, card)}**`)
        return ctx.bot.rest.channels.createMessage(ctx.interaction.channelID, {content: card.imgur})
    }

    return ctx.sendInteraction(ctx, user, {
        embed: {
            image: {url: card.url},
            color: ctx.colors.blue,
            description: `**${user.username}** summons **${formatCard(ctx, card)}**!`
        }
    })
})


// To-Do Eval Query Display
const cards = withCards(async (ctx, user, args, cards) => {
    let cardStr = cards.map(x => {
        const isNew = x.obtained > (user.lastDaily || new Date())
        return `${isNew? '**[new]** ': ''}${formatCard(ctx, x)}${x.amount > 1? ` (x${x.amount})`: ''}${x.rating? `[${x.rating}/10] ` : ''}`
    })

    await ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(cardStr, 20),
        buttons: ['first', 'last', 'next', 'back'],
        embed: { author: { name: `${user.username}, your cards (${cards.length} results)` } }
    })
})

const globalCards = withCards(async (ctx, user, args, cards) => {
    let cardStr = cards.map(x => `${formatCard(ctx, x)}${x.amount > 1? ` (x${x.amount})`: ''}`)
    let pages = ctx.makePages(cardStr, 20)

    await ctx.sendInteraction(ctx, user, {
        pages,
        buttons: ['first', 'last', 'next', 'back'],
        embed: { author: { name: `Matched cards from database (${cards.length} results)` } }
    })
}, {global: true})