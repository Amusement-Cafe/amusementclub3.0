const calculateClaimCost = (ctx, count, claimCount, promo = false) => {
    const activeDiscount = ctx.promos.find(x => x.isDiscount === true && x.expires > new Date() && x.starts < new Date())

    // const activeDiscount = 100
    let price = 0
    let base = promo? 25: 50
    let cost = activeDiscount && !promo? Math.floor(base * (activeDiscount.discount/ 100)): base
    cost = ctx.isGuildDM(ctx)? cost: cost + ((ctx.guild.tax / 100) * cost)
    let claims = claimCount || 0
    for (let i = 0; i < count; i++) {
        claims++
        price += claims * cost
    }
    return Math.round(price)
}

module.exports = {
    calculateClaimCost,
}