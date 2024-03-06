const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:         { type: String, index: true },
    cardID:         { type: Number, index: true },

    added:          { type: Date, default: Date.now }
})
module.exports = model('UserWishlist', schema)