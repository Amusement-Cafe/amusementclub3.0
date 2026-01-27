const {
    registerBotCommand,
    registerReaction,
} = require('../../../utils/commandRegistrar')

const {
    Button,
    Selection,
} = require('../helpers/componentBuilders')

const {
    AsciiTable3,
} = require("ascii-table3")

const menus = require('../static/menus/preferences/preferences.json')
const embeds = require('../static/embeds/preferences.json')
const profileModals = require('../static/modals/profile.json')

const home = new Button('preferences_start').setLabel('Main Menu').setStyle(2)

registerBotCommand(['preferences'], async (ctx) => await preferencesStart(ctx))

registerReaction(['preferences', 'start'], async (ctx) => await preferencesStart(ctx, true))
registerReaction(['preference', 'category'], async (ctx) => await preferencesCategory(ctx))
registerReaction(['preference', 'preference'], async (ctx) => await preferenceDisplay(ctx))
registerReaction(['preference', 'choice'], async (ctx) => await preferenceChoice(ctx))
registerReaction(['preference', 'toggle'], async (ctx) => await preferenceToggle(ctx))
registerReaction(['preference', 'modal'], async (ctx) => await preferenceModal(ctx))
registerReaction(['preference', 'profile'], async (ctx) => await preferenceProfile(ctx))


const preferencesStart = async (ctx, back = false) => {
    const embed = embeds.mainMenu
    const select = new Selection('preference_category').setOptions(menus.all)
    return ctx.send(ctx, {
        embed,
        selection: [select],
        parent: back
    })
}

const preferencesCategory = async (ctx) => {
    const option = ctx.arguments[0]
    const embed = embeds[option]
    const select = new Selection('preference_preference').setOptions(menus[option])
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

    if (category === 'profile') {
        if (!ctx.user.roles.some(x => x === 'admin')) {
            await ctx.interaction.defer(64)
            return ctx.send(ctx, `This is currently an admin only command.`)
        }
        const openModal = new Button(`preference_modal-${category}-${preference}`).setStyle(1).setLabel('Open Modal')
        customButtons.push(openModal)
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
    } else {
        customButtons.push(new Button(`preference_toggle-${category}-${preference}-test`).setStyle(4).setLabel('Disable').setOff(!ctx.user.preferences[category][preference]))
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
    const [category, preference] = ctx.arguments
    const modal = profileModals[preference]
    return ctx.interaction.createModal({
        title: `Profile Preferences Selection`,
        customID: `preference_profile`,
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