const {getCommandOptions} = require("./optionsHandler");
const {Collections, Cards} = require("../db");

const ctxFiller = async (ctx) => {
    ctx.args = await getCommandOptions(ctx, ctx.user)
    ctx.collections = await Collections.find().lean()
    ctx.cards = await Cards.find().lean()
    return ctx
}

module.exports = {
    ctxFiller
}