const mongoose = require('mongoose')

const {
    getConfig
} = require("./fileHelpers")

let db

const getDBConnection = () => {
    if (db)
        return db
    let config = getConfig()
    require('../db')
    db = mongoose.connect(config.database.url)
    return db
}

module.exports = {
    getDBConnection
}