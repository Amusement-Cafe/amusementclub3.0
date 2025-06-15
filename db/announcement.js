const {model, Schema} = require('mongoose')

const schema = new Schema({
    date:       { type: Date, default: new Date() },

    title:      { type: String, default: 'Announcement' },
    body:       { type: String, default: '' },

    notify:     { type: Boolean, default: true },
    expires:    { type: Boolean, default: false },
})
module.exports = model('Announcement', schema)