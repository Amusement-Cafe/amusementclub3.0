

const byAlias = (ctx, name) => {
    const regex = new RegExp(name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    return ctx.collections.filter(x => x.aliases.some(y => regex.test(y)))
}

const bestColMatch = (ctx, name) => {
    const c = byAlias(ctx, name)
    return c.sort((a, b) => a.id.length - b.id.length)
}

const resetNeeds = (collectionCards) => {
    if (collectionCards.length < 200)
        return {
            4: collectionCards.filter(x => x.level === 4).length,
            3: collectionCards.filter(x => x.level === 3).length,
            2: collectionCards.filter(x => x.level === 2).length,
            1: collectionCards.filter(x => x.level === 1).length,
            total: collectionCards.length
        }

    const division = collectionCards.length / 200
    return {
        4: Math.floor(collectionCards.filter(x => x.level === 4).length / division),
        3: Math.floor(collectionCards.filter(x => x.level === 3).length / division),
        2: Math.floor(collectionCards.filter(x => x.level === 2).length / division),
        1: Math.floor(collectionCards.filter(x => x.level === 1).length / division),
        total: 200
    }
}

const resetCollection = () => {}

module.exports = {
    bestColMatch,
    byAlias,
    resetCollection,
    resetNeeds,
}