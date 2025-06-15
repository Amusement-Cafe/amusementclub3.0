const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:     { type: String, index: true },
    questID:    { type: String },
    type:       { type: String },


    completed:  { type: Boolean, default: false },

    created:    { type: Date, default: new Date() },
    expires:    { type: Date, default: new Date() },

})
module.exports = model('UserQuest', schema)