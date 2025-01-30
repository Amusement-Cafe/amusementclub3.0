const mongoose = require('mongoose')

let db

const getDBConnection = (ctx) => {
    if (db)
        return db
    require('../db')
    db = mongoose.connect(ctx.config.database.url)
    return db
}

module.exports = {
    getDBConnection
}