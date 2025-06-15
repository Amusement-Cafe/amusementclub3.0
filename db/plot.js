const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:            { type: String, index: true },
    userID:             { type: String },

    nextCheck:          { type: Date, default: new Date() },

    building:   {
        installed:      { type: Date, default: new Date() },
        lastCollected:  { type: Date, default: new Date() },

        buildingID:     { type: String },

        level:          { type: Number },
        storedLemons:   { type: Number },

        storedCards:    { type: Array, default: [] },
    }
})
module.exports = model('Plot', schema)