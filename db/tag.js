const {model, Schema} = require('mongoose')

const schema = new Schema({
    tagName:        { type: String },
    userID:         { type: String },
    status:         { type: String, default: 'clear' },

    cardID:         { type: Number, default: -1 },

    upvotes:        { type: Array, default: [] },
    downvotes:      { type: Array, default: [] },

})
module.exports = model('Tag', schema)