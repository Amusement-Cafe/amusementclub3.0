const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:        { type: String },
    channelID:      { type: String },
    messageID:      { type: String },
    userID:         { type: String },

    listPrice:      { type: Number, default: 0 },
    timeLength:     { type: Number, default: 0 },

    cardIDs:        { type: Array, default: [] },

    paid:           { type: Boolean, default: false },
    processing:     { type: Boolean, default: false },

    created:        { type: Date, default: new Date() }
})
module.exports = model('AuctionQueue', schema)