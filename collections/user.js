const {model, Schema} = require('mongoose')

const schema = new Schema({
    userid:             { type: String, index: true },
    username:           { type: String },

    tomatoes:           { type: Number, default: 0, index: true },
    joined:             { type: Date },

    lastdaily:          { type: Date, default: new Date() },

})
module.exports = model('User', schema)