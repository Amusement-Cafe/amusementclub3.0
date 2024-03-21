const {
    cmd,
    rct,
} = require('../utils/cmd')

const {
    Button
} = require("../staticdata/components")

const storeEmbeds = require('../staticdata/selectmenus/embeds/store.json')
const storeMenus  = require('../staticdata/selectmenus/menus/store.json')

const btnReturn = new Button('storeReturn_blah').setLabel('Main Menu').setStyle(2)

cmd(['store', 'view'], async (ctx, user, args) => await storeMain(ctx, user, args))

rct('storeReturn', async (ctx, user, args) => await storeMain(ctx, user, args, true))
rct('storeMenu', async (ctx, user) => await displayMenu(ctx, user))
rct('storeItem', async (ctx, user) => await displayItem(ctx, user))
rct('storeBuy', async (ctx, user) => await buyItem(ctx, user), {forceDefer: true})



const storeMain = async (ctx, user, args, back = false) => {
    const select = {type:3, customID: 'storeMenu', options: storeMenus.all}

    if (!back)
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: storeEmbeds.mainMenu})
    else
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: storeEmbeds.mainMenu, parent: true})
}

const displayMenu = async (ctx, user) => {
    const menu = ctx.id.pop()
    const options = storeMenus[menu]
    const selectMenu = {type: 3, customID: 'storeItem', options}
    await ctx.sendInteraction(ctx, user, {selection: [selectMenu], customButtons: [btnReturn], embed: storeEmbeds[menu], parent: true})
}

const displayItem = async (ctx, user) => {
    const item = ctx.id.pop().split('_')
    let response = {parent: true}
    response.embed = storeEmbeds[item[1]]
    response.customButtons = [btnReturn]
    response.customButtons.push(new Button(`storeBuy_${item[1]}`).setLabel('Buy Now!').setStyle(3))
    await ctx.sendInteraction(ctx, user, response)
}

const buyItem = async (ctx, user) => {
    return ctx.reply(user, `you totally just bought ${ctx.id.pop().split('_')[0]}`)
}