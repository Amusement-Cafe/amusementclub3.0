const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:            { type: String, index: true },
    userID:             { type: String },

    nextCheck:          { type: Date, default: Date.now },

    building:   {
        installed:      { type: Date, default: Date.now },
        lastCollected:  { type: Date, default: Date.now },

        buildingID:     { type: String },

        level:          { type: Number },
        storedLemons:   { type: Number },

        storedCards:    { type: Array, default: [] },
    }
})
module.exports = model('Plot', schema)