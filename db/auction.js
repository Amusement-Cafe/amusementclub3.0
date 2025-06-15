const {model, Schema} = require('mongoose')

const schema = new Schema({
    auctionID:      { type: String },
    guildID:        { type: String },
    userID:         { type: String },
    lastBidderID:   { type: String },

    ended:          { type: Boolean, default: false },
    cancelled:      { type: Boolean, default: false },

    price:          { type: Number, default: 0 },
    highBid:        { type: Number, default: 0 },
    cardID:         { type: Number, default: -1 },

    bids:           { type: Array, default: [] },

    expires:        { type: Date },
    time:           { type: Date },

})
module.exports = model('Auction', schema)