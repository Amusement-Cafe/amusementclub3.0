const {model, Schema} = require('mongoose')

const schema = new Schema({
    promoID:        { type: String },
    collectionID:   { type: String },
    name:           { type: String },
    currency:       { type: String },

    isBoost:        { type: Boolean, default: false },
    cards:          { type: Array, default: [] },
    rate:           { type: Number },

    starts:         { type: Date },
    expires:        { type: Date },
})
module.exports = model('Promo', schema)