const cliCommands = new Map()
const botCommands = {}


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

const handleAyanoCommand = (input, extras) => {
    let currentLevel = botCommands

    console.log(input)
    console.log(botCommands)
    for (let cmd of input) {
        if (!currentLevel[cmd]) {
            return console.log(`${input.join(' ')} is NOT a command.... yet?`)
        }
        currentLevel = currentLevel[cmd]
    }

    if (!currentLevel.handler) {
        return console.log(`Somehow you have run a command without a handler!`)
    }

    if (currentLevel.handler) {
        return currentLevel.handler(extras.ctx, currentLevel.options, extras)
    } else {
        return console.log(`${input.join(' ')} doesn't have a handler?`)
    }
}

const handleAmusementCommand = (input, extras) => {
    let currentLevel = botCommands
    console.log(botCommands)
    for (let cmd of input) {
        if (!currentLevel[cmd]) {
            return console.log(`${input.join(' ')} is NOT a command.... yet?`)
        }
        currentLevel = currentLevel[cmd]
    }

    if (!currentLevel.handler) {
        return console.log(`Somehow you have run a command without a handler!`)
    }

    if (currentLevel.options?.perms && currentLevel.options.perms.length > 0) {
        if (!currentLevel.options.perms.find(x => extras.user.roles.some(y => x === y))) {
            return extras.interaction.reply({content:`You don't have permission to use this command`})
        }
    }

    if (currentLevel.options?.premium && !extras.user.premium.active) {
        return extras.interaction.reply({content:`This is an Amusement+ only command. See /tip for more Amusement+ info.`})
    }

    if (currentLevel.handler) {
        return currentLevel.handler(extras.ctx, currentLevel.options, extras)
    } else {
        return console.log(`${input.join(' ')} doesn't have a handler?`)
    }
}


registerCLICommand('hi', () => console.log('hello'))

module.exports = {
    registerBotCommand,
    registerCLICommand,
    handleAmusementCommand,
    handleAyanoCommand,
    handleCLICommand,
}