const child = require('child_process')

const {
    registerCLICommand
} = require("../utils/commandRegistrar")

const {
    getConfig
} = require("../utils/fileHelpers")

let bot
const createAmusement = async () => {
    const config = getConfig()
    bot = child.fork('./bots/amusement', {env: config.amusement})
    bot.on('error', (err) => console.log(err))
    bot.on('message', (message) => console.log(message))
    bot.send({startup: true})
}

const startAmusement = async () => {
    if (!bot) {
        await createAmusement()
    }
    bot.send({connect: true})
}

const stopAmusement = async () => {
    if (!bot) {
        return
    }
    bot.send({quit: true})
    bot.kill()
    bot = null
}

const restartAmusement = async () => {
    bot.send({quit: true})
    bot.kill()
    bot = null
    await startAmusement()
}

registerCLICommand('acstart', () => startAmusement())
registerCLICommand('acstop', () => stopAmusement())
registerCLICommand('acrestart', () => restartAmusement())

module.exports = {
    stopAmusement
}
