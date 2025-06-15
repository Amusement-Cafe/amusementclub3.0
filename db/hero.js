const {model, Schema} = require('mongoose')

const schema = new Schema({
    heroID:         { type: String },
    name:           { type: String },
    userID:         { type: String },
    
    xp:             { type: Number, default: 0 },
    followers:      { type: Number, default: -1 },

    accepted:       { type: Boolean, default: false },
    active:         { type: Boolean, default: false },

    submitted:      { type: Date, default: new Date() },

    pictures:       { type: Array, default: [] },
})
module.exports = model('Hero', schema)