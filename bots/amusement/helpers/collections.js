const getCollectionByAlias = (ctx, alias) => {
    let matchingAlias = []
    ctx.collections.forEach(col => col.aliases.includes(alias)? matchingAlias.push(col) : col)
    return matchingAlias
}

module.exports = {
    getCollectionByAlias
}