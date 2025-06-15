const {model, Schema} = require('mongoose')

const schema = new Schema({
    transactionID:  { type: String },
    url:            { type: String },
    type:           { type: String },
    email:          { type: String },

    amount:         { type: Number },

    received:       { type: Date, default: new Date()}

})
module.exports = model('Support', schema)