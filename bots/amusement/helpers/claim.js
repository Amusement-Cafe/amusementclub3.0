const calculateClaimCost = (ctx, count, claimCount) => {
    const activeDiscount = ctx.promos.find(x => x.isDiscount === true && x.expires > new Date())

    // const activeDiscount = 100
    let price = 0
    let cost = activeDiscount? Math.floor(50 * (activeDiscount.discount/ 100)): 50

    for (let i = 0; i < count; i++) {
        price += cost + (cost * i)
    }
    return price
}

module.exports = {
    calculateClaimCost,
}