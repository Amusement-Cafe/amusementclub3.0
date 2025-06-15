const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:         { type: String, index: true },
    cardID:         { type: String },

    added:          { type: Date, default: new Date() },
})
module.exports = model('UserWishlist', schema)