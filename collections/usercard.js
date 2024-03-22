const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:         { type: String, index: true },
    cardID:         { type: Number, index: true },

    fav:            { type: Boolean, default: false },
    locked:         { type: Boolean, default: false },
    amount:         { type: Number, default: 1 },
    rating:         { type: Number, default: 0 },
    personalTags:   { type: Array, default: [] },
    obtained:       { type: Date, default: new Date() },
})
module.exports = model('UserCard', schema)