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

cmd('daily', async (ctx, user, args) => await daily(ctx, user, args))

cmd('cards', async (ctx, user, args) => await cards(ctx, user, args))

cmd('balance', async (ctx, user, args) => await balance(ctx, user, args))

cmd('profile', async (ctx, user, args) => await defaultFunction(ctx, user, args))

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

const daily = async (ctx, user, args) => {
    if (user.lastdaily > subTime(new Date(), 20, 'hours')) {
        return ctx.reply(user, `your daily is not ready yet! You can claim your daily <t:${Math.floor(new Date(addTime(user.lastdaily, 20, 'hours')).getTime() / 1000)}:R>`, 'red')
    }
    user.lastdaily = new Date()
    user.tomatoes += 1
    await user.save()

    await ctx.reply(user, `you claimed daily and got a tomato!`, 'green')
}

const cards = async (ctx, user, args) => {
    await ctx.reply(user, `this is a test of reply!`)
}

const balance = async (ctx, user, args) => {
    return ctx.reply(user, `you have **${Math.round(user.tomatoes)}** ${ctx.symbols.tomato}, **${Math.round(user.vials)}** ${ctx.symbols.vial} and **${Math.round(user.lemons)}** ${ctx.symbols.lemon}`, 'green')
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