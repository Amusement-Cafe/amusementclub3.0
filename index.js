const readline = require('readline')
const {
    handleCLICommand,
} = require('./utils/commandRegistrar')

const {
    startAyano,
    stopAyano
} = require("./managers/ayano")

const {
    startAmusement,
    stopAmusement,
} = require("./managers/amusement")

require('./managers')

let prompt

console.log(`AmusementCLI v1.0`)
prompt = readline.createInterface(process.stdin, process.stdout)
prompt.setPrompt('')
prompt.prompt()

prompt.on('line', async line => {
    if (line === "quit" || line === "q") {
        await stopAyano()
        await stopAmusement()
        return prompt.close()
    }
    if (line === "start") {
        await startAyano()
        await startAmusement()
        return prompt.prompt()
    }
    await handleCLICommand(line, {roles: ['cliAdmin']})
    prompt.prompt()
})

prompt.on('close', async () => {
    console.log('Bye')
    process.exit(0)
})