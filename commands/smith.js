const _ = require('lodash')

const {
    cmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    addUserCards,
    removeUserCards,
    getSpecificUserCards
} = require("../modules/usercards")

cmd('forge', async (ctx, user, args) => await forge(ctx, user, args))

cmd('draw', async (ctx, user, args) => await draw(ctx, user, args))

cmd(['liquefy', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['liquefy', 'many'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'smith command'})
}

// ToDo Stats, Costs, Vial Returns
const forge = withCards(async (ctx, user, args, cards) => {
    const batch1 = cards[0].filter(x => !x.locked)
    const batch2 = cards[1].filter(x => !x.locked)

    if (batch1.length === 0)
        return ctx.reply(user, `no cards found in request **1** to forge!`, 'red')

    if (batch2.length === 0)
        return ctx.reply(user, `no cards found in request **2** to forge!`, 'red')
    const card1 = batch1[0]
    const card2 = batch2.filter(x => x.id !== card1.id)[0]

    if (!card2)
        return ctx.reply(user, `not enough unique cards found matching this query.
            You can specify one query that can get 2+ unique cards in \`card_query_1\`, or specify a second query using \`card_query_2\`!`, 'red')

    if (card1.level !== card2.level)
        return ctx.reply(user, `you can only forge cards of the same rarity!`, 'red')

    if (card1.level > 4)
        return ctx.reply(user, `you cannot forge legendary cards! To attempt to acquire a different legendary card, look for the legendary swapper in the \`/store\`!`, 'red')

    if((card1.fav && card1.amount === 1) || (card2.fav && card2.amount === 1))
        return ctx.reply(user, `your query contains last copy of your favorite card(s). Please remove it from favorites and try again`, 'red')

    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `Do you want to forge ${formatCard(ctx, card1)}**(x${card1.amount})** and ${formatCard(ctx, card2)}**(x${card2.amount})** using **${ctx.numFmt(0)}** ${ctx.symbols.tomatoes}?
        You will get **${ctx.numFmt(0)}** ${ctx.symbols.vials} and a **${card1.level} ${ctx.symbols.star} card**`
        },
        onConfirm: async () => {
            let newCard = ctx.cards.filter(x => x.level === card1.level && x.id !== card1.id && x.id !== card2.id)

            if (card1.col === card2.col)
                newCard = newCard.filter(x => x.col === card1.col)
            else
                newCard = newCard.filter(x => !ctx.collections.find(y => y.id === x.col).promo)

            newCard = _.sample(newCard)

            if (!newCard)
                return ctx.reply(user, `an error has occurred while getting a new card, please try your command again!`, 'red', {edit: true})

            await removeUserCards(user, [card1.id, card2.id])

            await addUserCards(user, [newCard.id])

            const userCard = await getSpecificUserCards(user, [newCard.id], true)

            return ctx.reply(user, {
                image: { url: newCard.url },
                color: ctx.colors.blue,
                description: `you got ${formatCard(ctx, newCard)}!
                        **${ctx.numFmt(0)}** ${ctx.symbols.vials} were added to your account
                        ${userCard[0].amount > 1 ? `*You already have this card*` : ''}`
            }, 'green', {edit: true})
        }
    })
})

// ToDo Stats based price increase, Eval filtering, Diff filtering
const draw = withCards(async (ctx, user, args, cards) => {
    const card = cards[0]

    if (ctx.collections.find(x => x.id === card.col).promo)
        return ctx.reply(user, `you cannot draw promo cards!`, 'red')

    if (card.level > 3)
        return ctx.reply(user, `you cannot draw cards with a rarity greater than 3!`, 'red')


    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        embed: {
            description: `**${user.username}**, Do you want to draw ${formatCard(ctx, card)} using **${ctx.numFmt(5)}** ${ctx.symbols.vials}?`
        },
        onConfirm: async () => {
            await addUserCards(user, [card.id])
            return ctx.reply(user, {
                image: { url: card.url },
                color: ctx.colors.blue,
                description: `you got ${formatCard(ctx, card)}!
                    You have **${ctx.numFmt(user.vials)}** ${ctx.symbols.vials} remaining`
            }, 'green', {edit: true})
        }
    })

}, {global: true})