const _ = require('lodash')
const nodeHtmlToImage = require('node-html-to-image')
const htmlProfile = require('../staticdata/profile')

const {
    cmd,
    rct,
} = require('../utils/cmd')

const {
    addTime,
    subTime,
} = require('../utils/tools')

const {
    Button
} = require('../staticdata/components')

const {
    send
} = require('../modules/messages')


cmd('daily', async (ctx, user) => await daily(ctx, user))

cmd('balance', async (ctx, user, args) => await balance(ctx, user, args))

cmd('profile', async (ctx, user, args) => await profile(ctx, user, args))

cmd('has', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('miss', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('stats', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('achievements', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('vote', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd('todo', async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'use'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['inventory', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'from'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['diff', 'for'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['quest', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

rct('red', async (ctx, user, args) => await buttonFunction(ctx, user, args))
rct('green', async (ctx, user, args) => await buttonFunction(ctx, user, args))
rct('stringy', async (ctx, user, args) => await selectFunction(ctx, user, args))

const daily = async (ctx, user) => {
    if (user.lastDaily > subTime(new Date(), 20, 'hours')) {
        return ctx.reply(user, `your daily is not ready yet! You can claim your daily <t:${Math.floor(new Date(addTime(user.lastDaily, 20, 'hours')).getTime() / 1000)}:R>`, 'red')
    }
    user.lastDaily = new Date()
    user.tomatoes += 1
    await user.save()

    await ctx.reply(user, `you claimed daily and got a tomato!`, 'green')
}

const balance = async (ctx, user, args) => {
    return ctx.reply(user, `you have **${Math.round(user.tomatoes)}** ${ctx.symbols.tomato}, **${Math.round(user.vials)}** ${ctx.symbols.vial} and **${Math.round(user.lemons)}** ${ctx.symbols.lemon}`, 'green')
}

const profile = async (ctx, user, args) => {
    await ctx.reply(user, `your profile image is currently being generated. Please wait a moment until it completes`, 'yellow')
    const thing = await nodeHtmlToImage({
        html: htmlProfile,
        puppeteerArgs: {
            args: [
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-setuid-sandbox",
                "--no-sandbox"
            ]
        },
        transparent: true,
        content: {
            avatar: ctx.interaction.user.avatarURL('png', 128),
            username: user.username
        }
    })
    return send(ctx, user, {embed: {image: {url: `attachment://profile.png`}, color: ctx.colors.blue}, files: [ {name: 'profile.png', contents: thing}], edit: true})
}

const defaultFunction = async (ctx, user, args) => {
    const btn = new Button('red_test_id').setLabel('Test Label').setStyle(4)
    const btn2 = new Button('green_anotherid').setLabel('Lol Label').setStyle(3)
    const select = {type:3, customID: 'stringy', options: [{description: 'option description', label: 'label 1', value: 'value1'}, {description: 'option description', label: 'label 2', value: 'value2'}]}
    await send(ctx, user, {select: [select], buttons: [btn, btn2], permissions: {interact: [ctx.interaction.user.id], select: [ctx.interaction.user.id]}, content: 'Buttons!'})
}

const buttonFunction = async (ctx, user, args) => {
    await ctx.interaction.defer()
    console.log(ctx.id)
    if (ctx.selection) {
        return await ctx.interaction.createFollowup({content: `You have selected the ${ctx.id.pop() === 'anotherid'? 'green': 'red'} button and your select option is ${ctx.selection.selection}`})
    }
    await ctx.interaction.editOriginal({content: `${ctx.id.pop()} BUTTON`, components:[]})
}

const selectFunction = async (ctx, user, args) => {
    await ctx.interaction.defer()
    await ctx.interaction.createFollowup({content: `You selected option ${ctx.id.pop()}`})
}