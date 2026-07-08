const child = require('child_process')

const {
    registerCLICommand
} = require("../utils/commandRegistrar")

let api
const createAPI = async () => {
    api = child.fork('./api')
    api.on('error', (err) => console.log(err))
    api.on('message', (message) => console.log(message))
    api.send({startup: true})
}

const startAPI = async () => {
    if (!api) {
        await createAPI()
    }
    api.send({listen: true})
}

const stopAPI = async () => {
    if (!api) {
        return
    }
    api.send({quit: true})
    api.kill()
    api = null
}

const restartAPI = async () => {
    api.send({quit: true})
    api.kill()
    api = null
    await startAPI()
}

const refreshAPIContext = async () => {
    api.send({refreshCTX: true})
}

registerCLICommand('apistart', () => startAPI())
registerCLICommand('apistop', () => stopAPI())
registerCLICommand('apirestart', () => restartAPI())

module.exports = {
    refreshAPIContext,
    restartAPI,
    startAPI,
    stopAPI
}
