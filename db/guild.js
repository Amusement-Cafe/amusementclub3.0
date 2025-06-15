const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:            { type: String, index: true},
    lockCol:            { type: String, default: '' },
    ownerID:            { type: String },
    reportChannel:      { type: String },
    hero:               { type: String },

    xp:                 { type: Number, default: 0 },
    tax:                { type: Number, default: 0 },
    tomatoes:           { type: Number, default: 0 },
    lemons:             { type: Number, default: 0 },
    buildPerms:         { type: Number, default: 3 },
    discount:           { type: Number, default: 0 },
    heroLoyalty:        { type: Number, default: 0 },

    nextCheck:          { type: Date, default: new Date() },
    lastLock:           { type: Date, default: new Date(0) },

    adminLock:          { type: Boolean, default: false },
    lockActive:         { type: Boolean, default: false },
    processing:         { type: Boolean, default: false },

})
module.exports = model('Guild', schema)