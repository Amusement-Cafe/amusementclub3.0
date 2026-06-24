const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:     { type: String, index: true },
    questID:    { type: String },
    type:       { type: String },


    completed:  { type: Boolean, default: false },

    created:    { type: Date, default: Date.now },
    expires:    { type: Date, default: Date.now },

})
module.exports = model('UserQuest', schema)