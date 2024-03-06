

const byAlias = (ctx, name) => {
    const regex = new RegExp(name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi')
    return ctx.collections.filter(x => x.aliases.some(y => regex.test(y)))
}

const bestColMatch = (ctx, name) => {
    const c = byAlias(ctx, name)
    return c.sort((a, b) => a.id.length - b.id.length)
}

module.exports = {
    bestColMatch,
    byAlias
}