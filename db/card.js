const {model, Schema} = require('mongoose')

const schema = new Schema({
    cardID:         { type: Number, index: true },
    level:          { type: Number },
    animated:       { type: Boolean, default: false },
    collectionID:   { type: String },
    cardName:       { type: String },
    displayName:    { type: String },
    added:          { type: Date },
    eval:           { type: Number },
    lastUpdatedEval:{ type: Date },

    ratingSum:      { type: Number, default: 0 },
    timesRated:     { type: Number, default: 0 },
    ownerCount:     { type: Number, default: -1 },

    meta:           {
        booruID:        { type: Number },
        booruScore:     { type: Number },
        booruRating:    { type: String },

        artist:         { type: String },
        pixivID:        { type: String },
        source:         { type: String },
        image:          { type: String },

        added:          { type: Date },
        author:         { type: String },
        contributor:    { type: String },
    },

    stats:          {
        soldToBot:       { type: Array, default: [] },
        auctionReturned: { type: Array, default: [] },
        auctionSales:    { type: Array, default: [] },
        wishlistCount:   { type: Number, default: 0 },
        auctionCount:    { type: Number, default: 0 },
        totalCopies:     { type: Number, default: 0 },
    }
})

module.exports = model('Card', schema)