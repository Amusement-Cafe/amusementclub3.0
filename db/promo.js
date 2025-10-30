const {model, Schema} = require('mongoose')

const schema = new Schema({
    promoID:            { type: String },
    promoName:          { type: String },
    promoCurrency:      { type: String, default: "`✨`" },

    isBoost:            { type: Boolean, default: false },
    isDiscount:         { type: Boolean, default: false },
    isBonus:            { type: Boolean, default: false },

    cardIDs:            { type: Array, default: [] },
    dropRate:           { type: Number },
    discount:           { type: Number },
    bonus:              { type: Number },

    starts:             { type: Date },
    expires:            { type: Date },
})
module.exports = model('Promo', schema)