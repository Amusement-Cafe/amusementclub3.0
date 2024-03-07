const {model, Schema} = require('mongoose')

const schema = new Schema({
    guildID:        { type: String, index: true },
    userID:         { type: String, index: true },
    guildName:      { type: String },
    nextCheck:      { type: Date, default: new Date() },
    building:       {
        installDate:    { type: Date   },
        lastCollected:  { type: Date   },
        id:             { type: String },
        level:          { type: Number },
        storedLemons:   { type: Number }
    },
})
module.exports = model('Plots', schema)