const calculateClaimCost = (ctx, count, claimCount) => {
    const activeDiscount = ctx.promos.find(x => x.isDiscount === true && x.expires > new Date() && x.starts < new Date())

    // const activeDiscount = 100
    let price = 0
    let cost = activeDiscount? Math.floor(50 * (activeDiscount.discount/ 100)): 50
    let claims = claimCount || 0
    for (let i = 0; i < count; i++) {
        claims++
        price += claims * cost
    }
    return price
}

module.exports = {
    calculateClaimCost,
}