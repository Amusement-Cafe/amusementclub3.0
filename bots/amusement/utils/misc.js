const formatEventName = (ctx, event) => {
    let type = event.isBoost? 'Claim Boost': event.isDiscount? 'Claim Discount': event.isBonus? 'Daily Bonus': `Promo`
    let expiresDate = ctx.timeDisplay(ctx, event.expires)
    return `[~${expiresDate}] **${event.promoName}** ${type}`
}

module.exports = {
    formatEventName,
}