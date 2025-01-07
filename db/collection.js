const {model, Schema} = require('mongoose')

const schema = new Schema({
    collectionID:   { type: String },
    name:           { type: String },
    origin:         { type: String },
    creatorID:      { type: String },

    stars:          { type: Array, default: [':star:', '<:bronze:1194177321511419904>', '<:silver:1194177323302408222>', '<:gold:1194177324485185556>'] },
    aliases:        { type: Array, default: [] },

    promo:          { type: Boolean, default: false },
    compressed:     { type: Boolean, default: false },
    inClaimPool:    { type: Boolean, default: true  },

    rarity:         { type: Number },

    dateAdded:      { type: Date, default: new Date() }
})

module.exports = model('Collection', schema)