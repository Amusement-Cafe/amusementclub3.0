const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand(['eval', 'one'], async (ctx) => await eval(ctx))
registerBotCommand(['eval', 'one', 'global'], async (ctx) => await eval(ctx, false, true))

registerBotCommand(['eval', 'many'], async (ctx) => await eval(ctx, true))
registerBotCommand(['eval', 'many', 'global'], async (ctx) => await eval(ctx, true, true))

const eval = async (ctx, many = false, global = false) => {
    let evals
    let multi = ctx.options.multi
    if (!multi || global) {
        ctx.args.fmtOptions.amount = false
    }

    if (global) {
        if (!many) {
            return ctx.send(ctx, `${ctx.formatName(ctx, ctx.globalCards[0])} is worth ${ctx.boldName(ctx.fmtNum(ctx.globalCards[0].eval))} ${ctx.symbols.tomato}`, 'blue')
        }
        evals = ctx.globalCards.reduce((acc, card) => {return acc + card.eval}, 0)
        return ctx.send(ctx, `Your query consisting of ${ctx.boldName(ctx.fmtNum(ctx.globalCards.length))} card(s) is worth ${ctx.boldName(ctx.fmtNum(evals))} ${ctx.symbols.tomato}`)
    }

    if (!many) {
        return ctx.send(ctx, `${ctx.formatName(ctx, ctx.userCards[0])} is worth ${ctx.boldName(ctx.fmtNum(ctx.userCards[0].eval * (multi? ctx.userCards[0].amount: 1)))} ${ctx.symbols.tomato}`, 'blue')
    }
    let totalCopies = 0
    evals = ctx.userCards.reduce((acc, card) => {totalCopies += card.amount; return acc + (multi? card.amount * card.eval: card.eval)}, 0)
    return ctx.send(ctx, `Your query consisting of ${ctx.boldName(ctx.fmtNum(totalCopies))} card is worth ${ctx.boldName(ctx.fmtNum(evals))} ${ctx.symbols.tomato}`)
}