const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:  { type: String, required: true },
    guildID: { type: String },
    command: { type: String },
    type:    { type: String, },
    options: { type: Array, default: [] },
    timeRan: { type: Date, default: new Date() }
})
module.exports = model('Commands', schema)