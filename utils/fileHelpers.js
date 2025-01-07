const YAML = require('yaml')
const {
    readFileSync
} = require("fs")

let config
const getConfig = () => {
    if (config)
        return config

    const configFile = readFileSync('./config.yaml', 'utf-8')
    const parsed = YAML.parse(configFile)

    config = parsed
    return config
}


module.exports = {
    getConfig
}