const formatEventName = (ctx, event) => {
    let type = event.isBoost? 'Claim Boost': event.isDiscount? 'Claim Discount': event.isBonus? 'Daily Bonus': `Promo`
    let expiresDate = ctx.timeDisplay(ctx, event.expires)
    return `[~${expiresDate}] **${event.promoName}** ${type}`
}

const getDashboardURL = (ctx) => {
    return ctx.config?.links?.dashboard?.startsWith('http') ? ctx.config.links.dashboard : null
}

module.exports = {
    formatEventName,
    getDashboardURL,
}