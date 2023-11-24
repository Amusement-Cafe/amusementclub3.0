const Oceanic   = require('oceanic.js')
const _         = require("lodash")

const {
    trigger,
    con,
} = require('./utils/cmd')

const bot = new Oceanic.Client({ auth: 'Bot ' + process.env.token})
const shards = new Oceanic.ShardManager(bot, {maxShards: parseInt(process.env.shards) })

process.on('message', async (message) => {
    const cmd = _.keys(message)
    await trigger('con', message, null, cmd)
})

con('startup', async (data) => {
    console.log(data)
    await bot.connect()
})

con('shutdown', async () => {
    await bot.disconnect(false)
    process.exit()
})

bot.on('ready', () => console.log('online'))

bot.on('error', async (err, sh) => {
    process.send({error: {message: err.message, stack: err.stack}})
})