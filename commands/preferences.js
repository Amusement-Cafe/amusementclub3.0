const _ = require('lodash')

const {
    cmd,
    rct,
    mod,
} = require('../utils/cmd')

const {
    Button
} = require("../staticdata/components")

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    bestColMatch,
} = require("../modules/collection")



const preferences = require('../staticdata/selectmenus/menus/preferences.json')
const embeds = require('../staticdata/selectmenus/embeds/preferences.json')
const modals = require('../staticdata/modals/profile.json')

const btnReturn = new Button('preferenceReturn').setLabel('Main Menu').setStyle(2)


cmd(['preferences', 'set', 'profile'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'set', 'interact'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'set', 'notify'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'all'], async (ctx, user, args) => await prefsMain(ctx, user, args))

cmd(['preferences', 'show', 'profile'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'interact'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'notify'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

rct('preferenceMenu', async (ctx, user, args) => await displayMenu(ctx, user, args))
rct('preferenceReturn', async (ctx, user, args) => await prefsMain(ctx, user, args, true))
rct('preferenceItem', async (ctx, user, args) => await displayPref(ctx, user, args))
rct('preferenceDisable', async (ctx, user, args) => await preferenceToggle(ctx, user, false))
rct('preferenceEnable', async (ctx, user, args) => await preferenceToggle(ctx, user, true))
rct('preferenceModal', async (ctx, user, args) => await preferenceModal(ctx), {deferless: true})
rct('profileTitle', async (ctx, user, args) => {
    user.preferences.profile.title = ctx.id.pop()
    await user.save()
    return ctx.sendInteraction(ctx, user, {embed: {description: `**${user.username}**, title set! You can see this in your \`/profile\`!`, color: ctx.colors.green}, customButtons: [btnReturn], parent: true})
})

mod('profileModal', async (ctx, user, args) => await profileModalResponse(ctx, user, args), {ephemeral: true})


const prefsMain = async (ctx, user, args, back = false) => {
    const select = {type:3, customID: 'preferenceMenu', options: preferences.all}

    if (!back)
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: embeds.mainMenu})
    else
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: embeds.mainMenu, parent: true})
}

const displayMenu = async (ctx, user, args) => {
    const menu = ctx.id.pop()
    const options = preferences[menu].filter(x => x.premium? user.premium.active: true)
    const selectMenu = {type: 3, customID: 'preferenceItem', options}
    await ctx.sendInteraction(ctx, user, {selection: [selectMenu], customButtons: [btnReturn], embed: embeds[menu], parent: true})
}

const displayPref = async (ctx, user, args) => {
    const options = ctx.id.pop().split('_')
    const isEnabled = user.preferences[options[0]][options[1]]

    let response = {parent: true}
    const isProfile = options[0] === 'profile'
    let selectResponse = ['title'].some(x => x === options[1])

    if (isProfile && !selectResponse) {
        const modalButton = new Button(`preferenceModal_profile_${options[1]}`).setStyle(1).setLabel('Open Response Modal')
        response.customButtons = [btnReturn, modalButton]
    } else if (selectResponse) {
        response.customButtons = [btnReturn]
        response.selection = []
        switch (options[1]) {
            case 'title':
                const availableTitles = ctx.achievements.filter(x => user.achievements.some(y => y === x.id) && x.title)?.map(x => {
                    return {title: x.title, id: x.id}
                })

                if (!availableTitles || availableTitles.length === 0)
                    return ctx.reply(user, `you have no achievements that grant titles!`, 'red', {parent: true})

                _.chunk(availableTitles, 25).map(x => {
                    response.selection.push({
                        type: 3,
                        customID: 'profileTitle',
                        options: x.map(y => {
                            return {
                                label: y.title.replace('{name}', user.username),
                                value: y.id,
                            }
                        }),
                        placeholder: "Please select a title",
                        maxValues: 1
                    })
                })
                break
        }
    } else {
        const btnEnable = new Button(`preferenceEnable_${options[0]}_${options[1]}`).setStyle(3).setLabel('Enable').setOff(isEnabled)
        const btnDisable = new Button(`preferenceDisable_${options[0]}_${options[1]}`).setStyle(4).setLabel('Disable').setOff(!isEnabled)
        response.customButtons = [btnReturn, btnDisable, btnEnable]
    }

    response.embed = embeds[options[1]]
    response.embed.color = (isEnabled || isProfile)? ctx.colors.green: ctx.colors.red

    await ctx.sendInteraction(ctx, user, response)
}

const preferenceToggle = async (ctx, user, toggle) => {
    const section = ctx.id[0]
    const option = ctx.id[1]
    user.preferences[section][option] = toggle
    await user.save()
    const btnEnable = new Button(`preferenceEnable_${section}_${option}`).setStyle(3).setLabel('Enable').setOff(toggle)
    const btnDisable = new Button(`preferenceDisable_${section}_${option}`).setStyle(4).setLabel('Disable').setOff(!toggle)
    let embed = embeds[option]
    embed.color = toggle? ctx.colors.green: ctx.colors.red
    await ctx.sendInteraction(ctx, user, {customButtons: [btnReturn, btnDisable, btnEnable], embed, parent: true})
}

const preferenceModal = async (ctx) => {
    const options = ctx.selection.selection.split('_')
    return ctx.interaction.createModal({
        title: "Profile Preference Selection",
        customID: "profileModal",
        components: modals[options[1]]
    })
}

const profileModalResponse = withCards(async (ctx, user, args, cards) => {
    const keys = _.keys(ctx.options)
    let col, response
    switch (keys[0]) {
        case 'favComplete':
            col = bestColMatch(ctx, ctx.options.favComplete)[0]
            if (!col)
                return ctx.reply(user, `no collection found matching \`${ctx.options.favComplete}\`!`, 'red', {edit: true})
            const completedCollection = user.completedCols.find(x => x.id === col.id)
            if (!completedCollection)
                return ctx.reply(user, `you have not completed the collection **${col.name}** so you cannot set it as your favorite completed collection.`, 'red', {edit: true})
            user.preferences.profile.favComplete = completedCollection.id
            response = `successfully set your favorite completed collection to **${col.name}**! You can now see it on your \`/profile\`.`
            break

        case 'favClout':
            col = bestColMatch(ctx, ctx.options.favClout)[0]
            if (!col)
                return ctx.reply(user, `no collection found matching \`${ctx.options.favClout}\`!`, 'red', {edit: true})
            const cloutedCollection = user.cloutedCols.find(x => x.id === col.id)
            if (!cloutedCollection)
                return ctx.reply(user, `you have not completed the collection **${col.name}** so you cannot set it as your favorite completed collection.`, 'red', {edit: true})
            user.preferences.profile.favClout = cloutedCollection.id
            response = `successfully set your favorite clouted collection to **${col.name}**! You can now see it on your \`/profile\`.`
            break

        case 'color':
            if (isNaN(Number(ctx.options.color)))
                return ctx.reply(user, `discord only takes decimal numbers, as such this argument only takes numbers between 1 and 16777215!`, 'red', {edit: true})
            user.preferences.profile.color = ctx.options.color
            response = `successfully set your color to the decimal value **${ctx.options.color}**! You can check the color [here](https://convertingcolors.com/decimal-color-${ctx.options.color}.html)!
            If that link displays something wrong, your color will also not work. Please be sure to use the Decimal value in the right column!`
            break

        case 'bio':
            if (ctx.options.bio.includes('www') || ctx.options.bio.includes('http'))
                return ctx.reply(user, `links to external websites are disallowed in bio's!`, 'red', {edit: true})
            user.preferences.profile.bio = ctx.options.bio
            response = `successfully set your bio to:\n${ctx.options.bio}`
            break

        default:
            if (cards.length === 0)
                return ctx.reply(user, `you need to own the card you want to set as favorite!`, 'red', {edit: true})
            user.preferences.profile.card = cards[0].id
            response = `successfully set your favorite card to ${formatCard(ctx, cards[0])}!`
    }
    await user.save()
    return ctx.reply(user, response, 'green', {edit: true})
}, {allowEmpty: true})


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'preferences command'})
}