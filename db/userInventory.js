const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:     { type: String, index: true },
    itemID:     { type: String },
    colID:      { type: String },

    acquired:   { type: Date },

    cards:      { type: Array },
})
module.exports = model('UserInventory', schema)