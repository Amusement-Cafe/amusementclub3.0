const withGlobalCards = async (ctx, args) => {
    let filteredGlobal = [...ctx.cards]
    args.cardQuery?.filters?.map(x => {
        filteredGlobal = filteredGlobal.filter(x)
        return filteredGlobal
    })
    filteredGlobal.sort(args.cardQuery.sort)
    return filteredGlobal
}

module.exports = {
    withGlobalCards
}