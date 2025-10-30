const child = require('child_process')

const {
    registerCLICommand,
} = require("../utils/commandRegistrar")

const {
    getConfig
} = require("../utils/fileHelpers")

const {
    restartAmusement
} = require("./amusement")

let bot
const createAyano = async () => {
    const config = getConfig()
    bot = child.fork('./bots/ayano', {env: config.ayano})
    bot.on('error', (err) => console.log(err))
    bot.on('message', async (message) => {
        console.log(message)
        if (message.restart) {
            console.log('Restarting...')
            await restartAyano()
        }
        if (message.restartac) {
            console.log('Restarting Amusement')
            await restartAmusement()
        }
    })
    // bot.on('exit', () => stopAyano())
}

const startAyano = async () => {
    if (!bot) {
        await createAyano()
    }
    bot.send({connect: true})
}

const stopAyano = async () => {
    if (!bot) {
        return
    }
    bot.send({quit: true})
    bot.kill()
    bot = null
}

const restartAyano = async () => {
    if (!bot) {
        return
    }
    bot.send({quit: true})
    bot.kill()
    bot = null
    await startAyano()
}

registerCLICommand('ayystart', () => startAyano())
registerCLICommand('ayystop', () => stopAyano())
registerCLICommand('ayyrestart', () => restartAyano())

module.exports = {
    startAyano,
    restartAyano,
    stopAyano
}
