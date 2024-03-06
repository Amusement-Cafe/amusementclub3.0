const {model, Schema} = require('mongoose')

const schema = new Schema({
    auctionID:      { type: String },

    ended:          { type: Boolean, default: false },
    cancelled:      { type: Boolean, default: false },

    price:          { type: Number, default: 0 },
    highBid:        { type: Number, default: 0 },

    userID:         { type: String },
    cardID:         { type: Number, default: -1 },
    lastBidderID:   { type: String },

    bids:           [],

    expires:        { type: Date },
    time:           { type: Date },

    guildID:        { type: String },
})
module.exports = model('Auction', schema)