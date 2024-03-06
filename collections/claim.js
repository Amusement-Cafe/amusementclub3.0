const {model, Schema} = require('mongoose')

const schema = new Schema({
    claimID:        { type: String, default: "aaaaaa", index: true },

    userID:         { type: String, index: true },
    guildID:        { type: String },
    cards:          [{ type: Number }],

    cost:           { type: Number },
    promo:          { type: Boolean, default: false },
    lock:           { type: String, default: "" },

    date:           { type: Date, default: new Date() },
})
module.exports = model('Claim', schema)