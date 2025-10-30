const {model, Schema} = require('mongoose')

const schema = new Schema({
    collectionID:   { type: String },
    name:           { type: String },
    origin:         { type: String },
    creatorID:      { type: String },

    stars:          { type: Array, default: ['★', '★', '★', '★', '★'] },
    aliases:        { type: Array, default: [] },

    promo:          { type: Boolean, default: false },
    compressed:     { type: Boolean, default: false },
    inClaimPool:    { type: Boolean, default: true  },

    rarity:         { type: Number },

    dateAdded:      { type: Date, default: new Date() }
})

module.exports = model('Collection', schema)