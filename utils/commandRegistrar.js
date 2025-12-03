const {ctxFiller} = require("./ctxFiller")
const cliCommands = new Map()
const botCommands = {}
const rctCommands = {}

const {
    selections,
    interactions,
} = require('./globalArrays')


const registerCLICommand = (command, handler, options) => {
    cliCommands.set(command, {handler, options})
}

const registerBotCommand = (command, handler, options) => {
    const commandArray = Array.isArray(command)? command: [command]
    let currentLevel = botCommands

    for (let cmd of commandArray) {
        if (!currentLevel[cmd]) {
            currentLevel[cmd] = {}
        }
        currentLevel = currentLevel[cmd]
    }

    currentLevel.handler = handler
    currentLevel.options = options
}

const registerReaction = (command, handler, options) => {
    const commandArray = Array.isArray(command)? command: [command]
    let currentLevel = rctCommands

    for (let cmd of commandArray) {
        if (!currentLevel[cmd]) {
            currentLevel[cmd] = {}
        }
        currentLevel = currentLevel[cmd]
    }

    currentLevel.handler = handler
    currentLevel.options = options
}

const registerModal = (modal, handler, options) => {

}

const handleCLICommand = (input) => {
    if (cliCommands.has(input)) {
        const {handler} = cliCommands.get(input)
        return handler(input)
    } else {
        let others = []
        cliCommands.forEach((v, k) => {
            if (k.toString().startsWith(input)) {
                others.push(k)
            }
        })
        console.log(`${input} is NOT a command.... yet?\nDid you mean to use one of these:\n${others.join('\n')}`)
    }
}

const handleBotCommand = async (input, ctx) => {
    let currentLevel = botCommands

    for (let cmd of input) {
        if (!currentLevel[cmd]) {
            return console.log(`${input.join(' ')} is NOT a command.... yet?`)
        }
        currentLevel = currentLevel[cmd]
    }

    if (!currentLevel.handler) {
        return console.log(`Somehow you have run a command without a handler!`)
    }

    let deferless, ephemeral
    if (currentLevel.options) {
        if (currentLevel.options.deferless) {
            deferless = true
        }

        if (currentLevel.options?.perms && currentLevel.options.perms.length > 0) {
            if (!currentLevel.options.perms.find(x => ctx.user.roles.some(y => x === y))) {
                return ctx.interaction.reply({content:`You don't have permission to use this command`})
            }
        }

        if (currentLevel.options?.premium && !ctx.user.premium.active) {
            return ctx.interaction.reply({content:`This is an Amusement+ only command. See /tip for more Amusement+ info.`})
        }

        if (currentLevel.options.ephemeral) {
            await ctx.interaction.defer(64)
            ephemeral = true
        }

        if (currentLevel.options.forceDefer) {
            await ctx.interaction.defer()
        }
    }

    if (!deferless && !ephemeral) {
        await ctx.interaction.defer()
    }

    ctx.cmdOptions = currentLevel.options || {}
    ctx = await ctxFiller(ctx)

    return currentLevel.handler(ctx)
}

const handleReaction = async (input, ctx) => {
    let currentLevel = rctCommands
    let commandSplit = input[0].split('-')
    const command = commandSplit.shift().split('_')
    const oldInteract = interactions.find(x => x.msgID === ctx.interaction.message.id)
    ctx.arguments = ctx.interaction.data.componentType === 3? ctx.interaction.data.values.raw: commandSplit[0]

    for (let cmd of command) {
        if (!currentLevel[cmd]) {
            return console.log(`${command.join(' ')} is NOT a reaction.... yet?`)
        }
        currentLevel = currentLevel[cmd]
    }

    if (!currentLevel.handler) {
        return console.log(`Somehow you have run a command without a handler!`)
    }
    ctx = await ctxFiller(ctx)

    if (!oldInteract) {
        const old = await ctx.bot.rest.channels.getMessage(ctx.interaction.message.channelID, ctx.interaction.message.id)
        await old.edit({embeds: old.embeds, content: old.content, components: []})
        await ctx.interaction.defer(64)
        return await ctx.interaction.createFollowup({
            embeds: [{
                description: `The message you tried to interact with has expired! Menus and buttons expire after 15 minutes!`,
                color: ctx.colors.red
            }]
        })
    }

    if (oldInteract.permissions?.pages?.indexOf(ctx.interaction.user.id) < 0) {
        await ctx.interaction.defer(64)
        return ctx.send(ctx, {embed: {
            description: `You are not allowed to interact with another user's messages!`,
                color: ctx.colors.red
            }})
    }
    return currentLevel.handler(ctx)
}

module.exports = {
    registerBotCommand,
    registerCLICommand,
    registerReaction,
    handleBotCommand,
    handleCLICommand,
    handleReaction,
}