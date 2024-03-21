const {
    cmd,
} = require("../utils/cmd")

const {
    withCards,
    formatCard,
}  = require("../modules/card")

const {
    fetchUser,
} = require("../modules/user")

const {
    wishlistAdd,
    wishlistGet,
    wishlistRemove,
} = require("../modules/wishlist")


cmd(['wish', 'list'], async (ctx, user, args) => await wishList(ctx, user, args))

cmd(['wish', 'one'], async (ctx, user, args) => await wishAddOne(ctx, user, args))

cmd(['wish', 'many'], async (ctx, user, args) => await wishAddMany(ctx, user, args))

cmd(['wish', 'remove', 'one'], async (ctx, user, args) => await wishRemoveOne(ctx, user, args))

cmd(['wish', 'remove', 'many'], async (ctx, user, args) => await wishRemoveMany(ctx, user, args))

const wishList = withCards(async(ctx, user, args, cards) => {
    let target
    let wish = await wishlistGet(user)

    if (args.userIDs[0]) {
        target = await fetchUser(args.userIDs[0])
        if (!target) {
            return ctx.reply(user, `no user found with id \`${args.userIDs[0]}\`!`, 'red')
        }
        wish = await wishlistGet(target)
        if (wish.length === 0) {
            return ctx.reply(user, `${target.username}'s wishlist is empty!`)
        }
    }

    if (wish.length === 0) {
        return ctx.reply(user, `your wishlist is empty. Use \`${ctx.prefix}wish add one\` to add cards to your wishlist`)
    }
    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(wish.map(x => `${formatCard(ctx, ctx.cards[x.cardID])}`)),
        embed: { author: { name: `${user.username}, ${target? `here is ${target.username}'s` :`your`} wishlist (${wish.length} results)` } }
    })
}, {global: true})

const wishAddOne = withCards(async(ctx, user, args, cards) => {
    await wishlistAdd(user, [cards[0].id])
    return ctx.reply(user, `you added ${formatCard(ctx, cards[0])} to your wishlist!`)
}, {global: true})

const wishAddMany = withCards(async(ctx, user, args, cards) => {
    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(x => formatCard(ctx, x))),
        embed: {
            title: `**${user.username}**, do you want to add the following cards to your wishlist?:`
        },
        onConfirm: async () => {
            await wishlistAdd(user, cards.map(x => x.id))
            return ctx.reply(user, `you added **${cards.length}** cards to your wishlist!`, 'green', {edit: true})
        }
    })
}, {global: true})

const wishRemoveOne = withCards(async(ctx, user, args, cards) => {
    await wishlistRemove(user, [cards[0].id])
    return ctx.reply(user, `you removed ${formatCard(ctx, cards[0])} from your wishlist!`)
}, {global: true})

const wishRemoveMany = withCards(async(ctx, user, args, cards) => {
    return ctx.sendInteraction(ctx, user, {
        confirmation: true,
        pages: ctx.makePages(cards.map(x => formatCard(ctx, x))),
        embed: {
            title: `**${user.username}**, do you want to remove the following cards to your wishlist?:`
        },
        onConfirm: async () => {
            await wishlistRemove(user, cards.map(x => x.id))
            return ctx.reply(user, `you removed **${cards.length}** cards to your wishlist!`, 'green', {edit: true})
        }
    })
}, {global: true})