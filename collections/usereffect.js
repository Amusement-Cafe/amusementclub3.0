const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:         {type: String, index: true},
    effectID:       {type: String},

    usesLeft:       {type: Number},

    cooldownEnds:   {type: Date},
    expires:        {type: Date},

    notified:       {type: Boolean, default: true},
})
module.exports = model('UserEffect', schema)