const {model, Schema} = require('mongoose')

const schema = new Schema({
    transactionID:      { type: String },
    toID:               { type: String },
    fromID:             { type: String },
    status:             { type: String },
    guildID:            { type: String },

    cost:               { type: Number },
    
    cardIDs:            { type: Array, Default: [] },

    dateCreated:        { type: Date },
})
module.exports = model('Transaction', schema)