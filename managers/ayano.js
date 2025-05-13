const child = require('child_process')

const {
    registerCLICommand,
} = require("../utils/commandRegistrar")

const {
    getConfig
} = require("../utils/fileHelpers")

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
    restartAyano,
    stopAyano
}
