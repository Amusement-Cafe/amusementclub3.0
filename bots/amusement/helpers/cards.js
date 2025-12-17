const withGlobalCards = async (ctx) => {
    let filteredGlobal = ctx.cards
    ctx.args.cardQuery?.filters?.map(x => {
        filteredGlobal = filteredGlobal.filter(x)
        return filteredGlobal
    })
    filteredGlobal.sort(ctx.args.cardQuery.sort)
    return filteredGlobal
}

module.exports = {
    withGlobalCards
}