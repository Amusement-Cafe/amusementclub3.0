const {model, Schema} = require('mongoose')

const schema = new Schema({
    claimID:        { type: String, default: 'aaaaaaa' },
    userID:         { type: String, index: true },
    guildID:        { type: String },
    lockCol:        { type: String, default: '' },

    cost:           { type: Number },

    cardIDs:        { type: Array, default: [] },

    promo:          { type: Boolean, default: false },

    timeClaimed:    { type: Date, default: new Date() },
})
module.exports = model('Claim', schema)