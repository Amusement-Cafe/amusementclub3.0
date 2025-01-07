const readline = require('readline')
const {
    handleCLICommand,
} = require('./utils/commandRegistrar')
require('./managers')
const {stopAyano} = require("./managers/ayano");
const {stopAmusement} = require("./managers/amusement");
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
    await handleCLICommand(line, {roles: ['cliAdmin']})
    prompt.prompt()
})

prompt.on('close', async () => {
    console.log('Bye')
    process.exit(0)
})