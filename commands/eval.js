const {
    cmd,
} = require('../utils/cmd')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    evalCard,
    getVialCost,
} = require("../modules/eval")

cmd(['eval', 'one'], async (ctx, user, args) => await evalOne(ctx, user, args))

cmd(['eval', 'many'], async (ctx, user, args) => await evalMany(ctx, user, args))

cmd(['eval', 'many', 'global'], async (ctx, user, args) => await evalManyGlobal(ctx, user, args))

const evalOne = withCards(async (ctx, user, args, cards) => {
    const card = cards[0]
    const price = evalCard(ctx, card)
    const vialCost = getVialCost(ctx, card, price)

    return ctx.reply(user, `card ${formatCard(ctx, card)} is worth **${price}**${ctx.symbols.tomatoes}${card.level < 4? `or **${vialCost}** ${ctx.symbols.vials}`: ''}`)
}, {global: true})

// To-Do User Count Update on NaN
const evalMany = withCards(async (ctx, user, args, cards) => {
    let price = 0
    let vials = 0
    let hadNaN

    cards.map(card => {
        const eval = evalCard(ctx, card)
        if (eval >= 1) {
            price += Math.round(eval) * card.amount
        } else {
            hadNaN = true
        }

        if (card.level < 4 && eval > 0)
            vials += getVialCost(ctx, card, eval) * card.amount
    })

    if (hadNaN) {
        return ctx.reply(user, `some of your cards are still processing their eval.
        Please check again in **INFINITY** for more accurate results.`, 'yellow')
    }

    return ctx.reply(user, `your request contains **${cards.length}** of your cards worth **${price}**${ctx.symbols.tomatoes}
    ${vials > 0? `or **${vials}**${ctx.symbols.vials} (for cards under 4 stars)`: ``}`)

})

const evalManyGlobal = withCards(async (ctx, user, args, cards) => {
    let price = 0
    let vials = 0
    let hadNaN

    cards.map(card => {
        const eval = evalCard(ctx, card)
        if (eval >= 1) {
            price += Math.round(eval)
        } else {
            hadNaN = true
        }

        if (card.level < 4 && eval > 0)
            vials += getVialCost(ctx, card, eval)
    })

    if (hadNaN) {
        return ctx.reply(user, `some cards are still processing their eval.
        Please check again in **INFINITY** for more accurate results.`, 'yellow')
    }

    return ctx.reply(user, `your request contains **${cards.length}** cards worth **${price}**${ctx.symbols.tomatoes}
    ${vials > 0? `or **${vials}**${ctx.symbols.vials} (for cards under 4 stars)`: ``}`)
}, {global: true})
