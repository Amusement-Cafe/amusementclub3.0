const {model, Schema} = require('mongoose')

const schema = new Schema({
    id:                 { type: String, required: true },
    userID:             { type: String, index: true },
    itemID:             { type: String },
    collectionID:       { type: String },
    type:               { type: String },

    acquired:           { type: Date },

    cards:              { type: Array },
})
module.exports = model('UserInventory', schema)