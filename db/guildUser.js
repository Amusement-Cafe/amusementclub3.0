const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:     { type: String, index: true },
    guildID:    { type: String },

    xp:         { type: Number, default: 0 },
    level:      { type: Number, default: 0 },
    donations:  { type: Number, default: 0 },

    roles:      { type: Array, default: [] },

})
module.exports = model('GuildUser', schema)