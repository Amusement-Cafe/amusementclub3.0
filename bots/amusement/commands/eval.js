const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand(['eval', 'one'], async (ctx) => await eval(ctx))

registerBotCommand(['eval', 'many'], async (ctx) => await eval(ctx, true))

const eval = async (ctx, many = false) => {
    if (!many) {
        return ctx.send(ctx, `${ctx.globalCards[0].eval} tomatoes`, 'blue')
    }
    let evals = ctx.globalCards.reduce((acc, card) => {return acc + card.eval}, 0)
    return ctx.send(ctx, `${evals} tomatoes`)
}