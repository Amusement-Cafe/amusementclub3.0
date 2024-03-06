const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:        { type: String, index: true },
    xp:             { type: Number, default: 0 },
    tax:            { type: Number, default: 0 },
    tomatoes:       { type: Number, default: 0 },
    lemons:         { type: Number, default: 0 },
    buildPerms:     { type: Number, default: 1 },

    nextCheck:      { type: Date, default: new Date() },
    reportChannel:  { type: String },
    lastCMDChannel: { type: String },
    ownerID:        { type: String },

    processing:     { type: Boolean, default: false },

    discount:       { type: Number, default: 0 },

    lock: {
        lastLockDate: { type: Date, default: new Date(0) },
        collection:   { type: String, default: '' },
        active:       { type: Boolean, default: false },
        adminSet:     { type: Boolean, default: false },
    },

    hero:           { type: String, default: '' },
    heroLoyalty:    { type: Number, default: 0 },
})
module.exports = model('Guild', schema)