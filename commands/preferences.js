const {
    cmd,
    rct,
} = require('../utils/cmd')

const {
    Button
} = require("../staticdata/components")

const btnReturn = new Button('preferenceReturn').setLabel('Main Menu').setStyle(2)

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
    ],
    interact: [
        {
            description: '',
            label: 'Can Has',
            value: 'interact_canhas'
        },
        {
            description: '',
            label: 'Can Diff',
            value: 'interact_candiff'
        },
        {
            description: '',
            label: 'Can Sell',
            value: 'interact_cansell'
        }
    ],
    notify: [
        {
            description: '',
            label: 'First Bid On Your Auctions',
            value: 'notify_aucbidme'
        },
        {
            description: '',
            label: 'Outbid On Auction Notification',
            value: 'notify_aucoutbid'
        },
        {
            description: '',
            label: 'New Bid On Auction Notification',
            value: 'notify_aucnewbid'
        },
        {
            description: '',
            label: 'Auction End Notification',
            value: 'notify_aucend'
        },
        {
            description: '',
            label: 'New Bot Announcements',
            value: 'notify_announce'
        },
        {
            description: '',
            label: 'Daily Ready Notifications',
            value: 'notify_daily'
        },
        {
            description: '',
            label: 'Vote Ready Notifications',
            value: 'notify_vote'
        },
        {
            description: '',
            label: 'Collection Completion Status Notifications',
            value: 'notify_completed'
        },
        {
            description: '',
            label: 'Effect Expires Or Comes Off Cooldown',
            value: 'notify_effectend'
        }
    ],
    profile: [
        {
            description: '',
            label: 'Set a custom bio',
            value: 'profile_bio'
        },
        {
            description: '',
            label: 'Choose a custom title',
            value: 'profile_title'
        },
        {
            description: '',
            label: 'Set a custom color',
            value: 'profile_color'
        },
        {
            description: '',
            label: 'Display your favorite card',
            value: 'profile_card'
        },
        {
            description: '',
            label: 'Set your favorite completed collection',
            value: 'profile_favcomplete'
        },
        {
            description: '',
            label: 'Set your favorite clouted collection',
            value: 'profile_favclout'
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
rct('preferenceItem', async (ctx, user, args) => await displayPref(ctx, user, args))
rct('preferenceDisable', async (ctx, user, args) => await prefDisable(ctx, user, args))
rct('preferenceEnable', async (ctx, user, args) => await prefEnable(ctx, user, args))


const prefsMain = async (ctx, user, args, back = false) => {
    const select = {type:3, customID: 'preferenceMenu', options: preferences.all}
    if (!back)
        await ctx.send(ctx, user, {select: [select], content: 'Choose the preference menu you want to view! (Hopefully this works)'})
    else
        await ctx.send(ctx, user, {select: [select], content: 'Choose the preference menu you want to view! (Hopefully this works)', parent: true})
}

const displayMenu = async (ctx, user, args) => {
    const menu = ctx.id.pop()
    const selectMenu = {type: 3, customID: 'preferenceItem', options: preferences[menu]}
    await ctx.send(ctx, user, {select: [selectMenu], buttons: [btnReturn], content: `Please select the option you want to change from the ${menu}`, parent: true})
    // await ctx.interaction.editParent({content: `This will soon show the ${ctx.id.pop()} menu....`, components: [btn]})
}

const displayPref = async (ctx, user, args) => {
    const options = ctx.id.pop().split('_')
    if (options[0] === 'profile') {
        return await ctx.reply(user, `profile options currently don't function.`, 'red', {buttons: [btnReturn], parent: true})
    }
    const isEnabled = user.prefs[options[0]][options[1]]
    const btnEnable = new Button(`preferenceEnable_${options[0]}_${options[1]}`).setStyle(3).setLabel('Enable').setOff(isEnabled)
    const btnDisable = new Button(`preferenceDisable_${options[0]}_${options[1]}`).setStyle(4).setLabel('Disable').setOff(!isEnabled)
    await ctx.send(ctx, user, {buttons: [btnReturn, btnDisable, btnEnable], content: `This is where an embed will show info for ${options[1]}`, parent: true})
}

const prefEnable = async (ctx, user, args) => {
    const section = ctx.id[0]
    const option = ctx.id[1]
    console.log(ctx.id)
    user.prefs[section][option] = true
    await user.save()
    const btnEnable = new Button(`preferenceEnable_${section}_${option}`).setStyle(3).setLabel('Enable').setOff(true)
    const btnDisable = new Button(`preferenceDisable_${section}_${option}`).setStyle(4).setLabel('Disable').setOff(false)
    await ctx.send(ctx, user, {buttons: [btnReturn, btnDisable, btnEnable], content: `This is where an embed will show info for ${ctx.id[1]}.\nCurrently ${user.prefs[section][option]}`, parent: true})
}

const prefDisable = async (ctx, user, args) => {
    const section = ctx.id[0]
    const option = ctx.id[1]
    user.prefs[section][option] = false
    await user.save()
    const btnEnable = new Button(`preferenceEnable_${section}_${option}`).setStyle(3).setLabel('Enable').setOff(false)
    const btnDisable = new Button(`preferenceDisable_${section}_${option}`).setStyle(4).setLabel('Disable').setOff(true)
    await ctx.send(ctx, user, {buttons: [btnReturn, btnDisable, btnEnable], content: `This is where an embed will show info for ${ctx.id[1]}.\nCurrently ${user.prefs[section][option]}`, parent: true})
}



const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'preferences command'})
}