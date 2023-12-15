const {
    cmd,
    rct,
} = require('../utils/cmd')

const {
    Button
} = require("../staticdata/components")

const preferences = {
    all: [
        {
            description: 'Display All Notification Preferences',
            label: 'Notification Preferences',
            value: 'notify'
        },
        {
            description: 'Display All Interaction Preferences',
            label: 'Interaction Preferences',
            value: 'interact'
        },
        {
            description: 'Display All Profile Preferences',
            label: 'Profile Preferences',
            value: 'profile'
        }
    ]
}

cmd(['preferences', 'set', 'profile'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'set', 'interact'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'set', 'notify'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'all'], async (ctx, user, args) => await prefsMain(ctx, user, args))

cmd(['preferences', 'show', 'profile'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'interact'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['preferences', 'show', 'notify'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

rct('preferenceMenu', async (ctx, user, args) => await displayMenu(ctx, user, args))
rct('preferenceReturn', async (ctx, user, args) => await prefsMain(ctx, user, args, true))


const prefsMain = async (ctx, user, args, back = false) => {
    const select = {type:3, customID: 'preferenceMenu', options: preferences.all}
    if (!back)
        await ctx.send(ctx, user, {select: [select], content: 'Choose the preference menu you want to view! (Hopefully this works)'})
    else
        await ctx.send(ctx, user, {select: [select], content: 'Choose the preference menu you want to view! (Hopefully this works)', parent: true})
}

const displayMenu = async (ctx, user, args) => {
    const btn = new Button('preferenceReturn').setLabel('Main Menu').setStyle(2)
    await ctx.send(ctx, user, {buttons: [btn], content: `This will soon show the ${ctx.id.pop()} menu....`, parent: true})
    // await ctx.interaction.editParent({content: `This will soon show the ${ctx.id.pop()} menu....`, components: [btn]})
}




const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'preferences command'})
}