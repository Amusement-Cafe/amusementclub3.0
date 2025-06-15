const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:             { type: String, index: true },
    effectName:         { type: String },

    slotExpires:        { type: Date },
    cooldown:           { type: Date },

    active:             { type: Boolean, default: true },
})
module.exports = model('UserSlot', schema)