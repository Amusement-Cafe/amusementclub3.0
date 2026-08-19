const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    generateGlobalCommand
} = require("../../../utils/commandGeneration")

const {
    Button,
    Selection,
} = require('../helpers/componentBuilders')

const {
    AsciiTable3,
} = require("ascii-table3")


const _ = require('lodash')
const menus = require('../static/menus/preferences/preferences.json')
const embeds = require('../static/embeds/preferences.json')
const profileModals = require('../static/modals/profile.json')
const cardQueryModal = require('../static/modals/cardQuery.json')

const home = new Button('preferences_start').setLabel('Main Menu').setStyle(2)

registerBotCommand(['preferences'], async (ctx) => await preferencesStart(ctx))
generateGlobalCommand('preferences', 'Access the preferences menus')

registerReaction(['preferences', 'start'], async (ctx) => await preferencesStart(ctx, true))
registerReaction(['preference', 'category'], async (ctx) => await preferencesCategory(ctx))
registerReaction(['preference', 'preference'], async (ctx) => await preferenceDisplay(ctx))
registerReaction(['preference', 'choice'], async (ctx) => await preferenceChoice(ctx))
registerReaction(['preference', 'toggle'], async (ctx) => await preferenceToggle(ctx))
registerReaction(['preference', 'modal'], async (ctx) => await preferenceModal(ctx))
registerReaction(['preference', 'profile'], async (ctx) => await preferenceProfile(ctx))
registerReaction(['preference', 'reward'], async (ctx) => await preferenceReward(ctx), {globalCards: true})


const preferencesStart = async (ctx, back = false) => {
    const embed = embeds.mainMenu
    const menu = menus.all.filter(x => x.premium? ctx.user.premium.active? true: ctx.user.boost.isServerBooster: true)
    const select = new Selection('preference_category').setOptions(menu)
    return ctx.send(ctx, {
        embed,
        selection: [select],
        parent: back
    })
}

const preferencesCategory = async (ctx) => {
    const option = ctx.arguments[0]
    const embed = embeds[option]
    const menu = menus[option].filter(x => {
        return x.premium? ctx.user.premium.active: true
    })
    const select = new Selection('preference_preference').setOptions(menu)
    return ctx.send(ctx, {
        parent: true,
        embed,
        selection: [select],
        customButtons: [home]
    })
}

const preferenceDisplay = async (ctx) => {
    const [category, preference] = ctx.arguments[0].split('_')
    let embed = Object.assign({}, embeds[preference])
    const customButtons = [home]
    let col
    if (category === 'profile' && preference !== 'title') {
        const openModal = new Button(`preference_modal-${category}-${preference}`).setStyle(1).setLabel('Open Modal')
        customButtons.push(openModal)
        embed.description +=`\nCurrently this option is set to `
        switch (preference) {
            case 'bio':
                embed.description += ctx.boldName(ctx.user.preferences.profile.bio) || 'nothing!'
                break;
            case 'color':
                embed.description += `${ctx.boldName(ctx.user.preferences.profile.color)}. Which is now the color of the current embed!`
                embed.color = ctx.user.preferences.profile.color
                break;
            case 'favClout':
                col = ctx.collections.find(x => x.collectionID === ctx.user.preferences.profile.favClout)
                embed.description += col? ctx.boldName(col.name): ' nothing!'
                break;
            case 'favComplete':
                col = ctx.collections.find(x => x.collectionID === ctx.user.preferences.profile.favComplete)
                embed.description += col? ctx.boldName(col.name): ' nothing!'
                break;
            case 'favCard':
                embed.description += ctx.user.preferences.profile.card? ctx.formatName(ctx, ctx.cards[ctx.user.preferences.profile.card]): 'nothing!'
                break
            default:
                embed.description += 'ERROR! If you see this, report it!'

        }
        return ctx.send(ctx, {
            embed,
            customButtons,
            parent: true,
        })
    } else if (menus[preference]) {
        let select
        if (preference === 'tables') {
            let table = new AsciiTable3('Sample').setStyle(`unicode-${ctx.user.preferences.display.tables}`)
            table.addRow("1", "2", "3")
            table.setAlignCenter(1)
            embed.description += `\n\`\`\`${table.toString()}\`\`\``
            select = new Selection('preference_choice').setOptions(menus[preference])
        }
        embed.color = ctx.colors.blue
        return ctx.send(ctx, {
            parent: true,
            customButtons,
            embed,
            selection: [select]
        })
    } else if (preference === 'title') {
        return ctx.send(ctx, {
            embed: {description: `WIP`},
            parent: true,
            customButtons,
        })
    } else if (category === 'reward') {
        const openModal = new Button(`preference_modal-${category}-${preference}`).setStyle(1).setLabel('Open Modal')
        customButtons.push(openModal)
        let active, choice
        switch (preference) {
            case 'kofi':
                active = ctx.user.premium.kofi.isActive
                choice = ctx.user.premium.kofi.reward
                break;
            case 'patreon':
                active = ctx.user.premium.patreon.isActive
                choice = ctx.user.premium.patreon.reward
                break;
            case 'boost':
                active = ctx.user.boost.isServerBooster
                choice = ctx.user.boost.boostReward
                break;
        }
        if (active && choice) {
            embed.image = {url: `${ctx.config.links.cards}${choice}`}
            embed.fields = [{
                name: `This is your currently selected monthly reward!`,
                value: `${ctx.formatName(ctx, ctx.cards[choice])}`,
            }]
        }
        return ctx.send(ctx, {
            parent: true,
            customButtons,
            embed,
        })
    } else {
        customButtons.push(new Button(`preference_toggle-${category}-${preference}-disable`).setStyle(4).setLabel('Disable').setOff(!ctx.user.preferences[category][preference]))
        customButtons.push(new Button(`preference_toggle-${category}-${preference}`).setStyle(3).setLabel('Enable').setOff(ctx.user.preferences[category][preference]))
        embed.color = ctx.user.preferences[category][preference]? ctx.colors.green: ctx.colors.red
        return ctx.send(ctx, {
            parent: true,
            customButtons,
            embed,

        })
    }


}

const preferenceChoice = async (ctx) => {
    const [category, preference, choice] = ctx.arguments[0].split('_')
    ctx.user.preferences[category][preference] = choice
    await ctx.user.save()
    ctx.arguments = [[category, preference].join('_')]
    await preferenceDisplay(ctx)
}

const preferenceToggle = async (ctx) => {
    const [category, preference, extra] = ctx.arguments
    ctx.user.preferences[category][preference] = !ctx.user.preferences[category][preference]
    await ctx.user.save()
    ctx.arguments = [[category, preference].join('_')]
    return preferenceDisplay(ctx)
}

const preferenceModal = async (ctx) => {
    if (!ctx.user.roles.some(x => x === 'admin')) {
        await ctx.interaction.defer(64)
        return ctx.send(ctx, `This is currently an admin only modal.`)
    }
    const [category, preference] = ctx.arguments
    let modal, title
    if (category === 'profile') {
        modal = profileModals[preference]
        title = 'Profile Preferences Selection'
    } else {
        modal = cardQueryModal
        title = 'Card Query Input'
    }
    return ctx.interaction.createModal({
        title,
        customID: `preference_${category}-${category}_${preference}`,
        components: modal,
    })
}

const preferenceProfile = async (ctx) => {
    const preferenceKey = Object.keys(ctx.options)[0]
    console.log(preferenceKey)
    let entry = ctx.options[preferenceKey]
    switch (preferenceKey) {
        case 'bio':
            console.log(entry)
            break;
        case 'color':
            console.log(entry)
            break;
        case 'collection':
            console.log(entry)
            console.log(ctx.args.cols)
            break;
        default:
            console.log(entry)
            console.log(ctx.userCards)
    }
}

const preferenceReward = async (ctx) => {
    console.log(ctx.arguments)
    const [category, preference] = ctx.arguments[0].split('_')
    console.log(preference)
    let eligibleCards = ctx.globalCards.filter(x => {
        if (preference === 'boost') {
            return x.rarity === 4 && x.collectionID === 'special'
        }
        return x.rarity === 4 && x.collectionID !=='limitedcraft'
    })
    if (eligibleCards.length === 0) {
        let currentEmbed = ctx.interaction.message.embeds[0]
        if (currentEmbed.fields.length > 0) {
            currentEmbed.fields.push({
                name: `Invalid Card Query:`,
                value: `There were no cards found for your query! Please try again with a different query. The card query must return a 4 star card not in the limited craft collection.`,
            })
        } else {
            currentEmbed.fields = [{
                name: `Invalid Card Query:`,
                value: `There were no cards found for your query! Please try again with a different query. The card query must return a 4 star card not in the limited craft collection.`,
            }]
        }
        currentEmbed.color = ctx.colors.red
        return ctx.send(ctx, {
            embed: currentEmbed,
            components: ctx.interaction.message.components,
            parent: true,
        })
    }
    let card = _.sample(eligibleCards)
    ctx.user.boost.boostReward = card.cardID
    await ctx.user.save()
    return await preferenceDisplay(ctx)
}