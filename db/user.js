const {model, Schema} = require('mongoose')

const schema = new Schema({
    userID:             { type: String, index: true },
    username:           { type: String },

    tomatoes:           { type: Number, default: 0 },
    vials:              { type: Number, default: 0 },
    lemons:             { type: Number, default: 0 },
    promoBal:           { type: Number, default: 0 },
    xp:                 { type: Number, default: 0 },

    streaks: {
        effects: {
            memoryVal:  { type: Number, default: 0 },
            memoryBday: { type: Number, default: 0 },
            memoryHall: { type: Number, default: 0 },
            memoryXmas: { type: Number, default: 0 },
            xmasSpace:      {type: Boolean, default: false},
            hallSpace:      {type: Boolean, default: false},
            bdaySpace:      {type: Boolean, default: false},
            valSpace:       {type: Boolean, default: false},
        },
        daily: {
            count:     { type: Number, default: 0 },
            lastCount: { type: Number, default: 0 },
            lastReset: { type: Date, default: new Date() }
        },
        donations: {
            kofi: {
                last: { type: Date },
                streak: { type: Number, default: 0 }
            },
            patreon: {
                last: { type: Date },
                streak: { type: Number, default: 0 }
            }
        }
    },

    ban: {
        full:           {type: Boolean, default: false},
        embargo:        {type: Boolean, default: false},
        report:         {type: Boolean, default: false},
        tags:           {type: Number,  default: 0},
    },

    completedCols:      { type: Array, default: [] },
    cloutedCols:        { type: Array, default: [] },
    achievements:       { type: Array, default: [] },

    lastDaily:          { type: Date, default: new Date() },
    lastAnnounce:       { type: Date, default: new Date() },
    lastMsg:            { type: String },
    lastCard:           { type: Number, default: -1 },

    dailyNotified:      { type: Boolean, default: true },

    hero:               { type: String },
    heroChanged:        { type: Date },
    heroSubmits:        { type: Number, default: 0 },

    roles:              { type: Array, default: [] },


    joined:             { type: Date },

    preferences:        {
        notify:  {
            aucBidMe:   { type: Boolean, default: true  },
            aucOutbid:  { type: Boolean, default: true  },
            aucNewBid:  { type: Boolean, default: false },
            aucEnd:     { type: Boolean, default: true  },
            announce:   { type: Boolean, default: false },
            daily:      { type: Boolean, default: false },
            vote:       { type: Boolean, default: false },
            completed:  { type: Boolean, default: true  },
            effectEnd:  { type: Boolean, default: false },
        },
        interact:   {
            canHas:     { type: Boolean, default: true  },
            canDiff:    { type: Boolean, default: true  },
            canSell:    { type: Boolean, default: true  },
        },
        profile:        {
            bio:        { type: String, default: 'This user has not set a bio' },
            title:      { type: String, default: '' },
            color:      { type: String, default: '16756480' },
            card:       { type: String, default: '' },
            favComplete:{ type: String, default: '' },
            favClout:   { type: String, default: '' },
        }
    },

    premium: {
        active:     { type: Boolean, default: false },
        tier:       { type: Number },
        expires:    { type: Date }
    },

})
module.exports = model('User', schema)