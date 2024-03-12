const {
    cmd,
    rct,
    mod,
} = require('../utils/cmd')

const {
    Button
} = require("../staticdata/components")

const preferences = require('../staticdata/selectmenus/menus/preferences.json')
const embeds = require('../staticdata/selectmenus/embeds/preferences.json')

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

// mod('profileThingy')


const prefsMain = async (ctx, user, args, back = false) => {
    const select = {type:3, customID: 'preferenceMenu', options: preferences.all}

    if (!back)
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: embeds.mainMenu})
    else
        await ctx.sendInteraction(ctx, user, {selection: [select], embed: embeds.mainMenu, parent: true})
}

const displayMenu = async (ctx, user, args) => {
    const menu = ctx.id.pop()
    const selectMenu = {type: 3, customID: 'preferenceItem', options: preferences[menu]}
    await ctx.sendInteraction(ctx, user, {selection: [selectMenu], customButtons: [btnReturn], embed: embeds[menu], parent: true})
}

const displayPref = async (ctx, user, args) => {
    const options = ctx.id.pop().split('_')
    const isEnabled = user.preferences[options[0]][options[1]]
    let buttons
    if (options[0] === 'profile') {
        const modalButton = new Button(`preferenceModal_profile_${options[1]}`).setStyle(1).setLabel('Open Response Modal')
        buttons = [btnReturn, modalButton]
    } else {
        const btnEnable = new Button(`preferenceEnable_${options[0]}_${options[1]}`).setStyle(3).setLabel('Enable').setOff(isEnabled)
        const btnDisable = new Button(`preferenceDisable_${options[0]}_${options[1]}`).setStyle(4).setLabel('Disable').setOff(!isEnabled)
        buttons = [btnReturn, btnDisable, btnEnable]
    }
    let embed = embeds[options[1]]
    embed.color = isEnabled? ctx.colors.green: ctx.colors.red
    await ctx.sendInteraction(ctx, user, {customButtons: buttons, embed, parent: true})
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
    return ctx.interaction.createModal({
        title: "Profile Modal Option Thing",
        customID: "profileThingy",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'announceTitle',
                        label: 'Announcement Title',
                        style: 1,
                        placeholder: 'Announcement Title Goes Here',
                        required: true
                    }
                ]
            }
        ]
    })
}



const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'preferences command'})
}