const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:         { type: String },

    cardID:         { type: Number },
    amount:         { type: Number,  default: 1 },
    rating:         { type: Number,  default: 0 },

    fav:            { type: Boolean, default: false },
    locked:         { type: Boolean, default: false },

    acquired:       { type: Date,    default: new Date() },

})

module.exports = model('UserCard', schema)