const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:    { type: String, index: true },
    buildingID: { type: String },

    level:      { type: Number, default: 1 },
    health:     { type: Number, default: 100 },
})
module.exports = model('GuildBuilding', schema)