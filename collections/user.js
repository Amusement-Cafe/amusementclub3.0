const {model, Schema} = require('mongoose')

const schema = new Schema({
    userid:             { type: String, index: true },
    username:           { type: String },

    tomatoes:           { type: Number, default: 0, index: true },
    vials:              { type: Number, default: 0, index: true },
    lemons:             { type: Number, default: 0, index: true },
    promobal:           { type: Number, default: 0, index: true },
    xp:                 { type: Number, default: 0, index: true },

    streaks: {
        effects: {
            memoryval:  { type: Number, default: 0 },
            memorybday: { type: Number, default: 0 },
            memoryhall: { type: Number, default: 0 },
            memoryxmas: { type: Number, default: 0 },
            xmasspace:      {type: Boolean, default: false},
            hallspace:      {type: Boolean, default: false},
            bdayspace:      {type: Boolean, default: false},
            valspace:       {type: Boolean, default: false},
        },
        votes: {
            topgg:      { type: Number, default: 0 },
            dbl:        { type: Number, default: 0 },
        },
        daily: {
            count: { type: Number, default: 0 },
            lastreset: { type: Date, default: new Date() }
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
        full:           {type: Boolean},
        embargo:        {type: Boolean},
        report:         {type: Boolean},
        tags:           {type: Number},
    },

    completedcols:      { type: Array, default: [] },
    cloutedcols:        { type: Array, default: [] },
    achievements:       { type: Array, default: [] },
    wishlist:           { type: Array, default: [] },

    lastdaily:          { type: Date, default: new Date() },
    lastvote:           { type: Date, default: new Date() },
    lastannounce:       { type: Date, default: new Date() },
    lastmsg:            { type: String },
    lastcard:           { type: Number, default: -1 },

    dailynotified:      { type: Boolean, default: true },
    votenotified:       { type: Boolean, default: false },

    hero:               { type: String },
    herochanged:        { type: Date },
    herosubmits:        { type: Number, default: 0 },

    roles:              { type: Array, default: [] },


    joined:             { type: Date },

    prefs:              {
        notify:  {
            aucbidme:   { type: Boolean, default: true  },
            aucoutbid:  { type: Boolean, default: true  },
            aucnewbid:  { type: Boolean, default: false },
            aucend:     { type: Boolean, default: true  },
            announce:   { type: Boolean, default: false },
            daily:      { type: Boolean, default: false },
            vote:       { type: Boolean, default: false },
            completed:  { type: Boolean, default: true  },
            effectend:  { type: Boolean, default: false },
        },
        interact:   {
            canhas:     { type: Boolean, default: true  },
            candiff:    { type: Boolean, default: true  },
            cansell:    { type: Boolean, default: true  },
        },
        profile:        {
            bio:        { type: String, default: 'This user has not set a bio' },
            title:      { type: String, default: '' },
            color:      { type: String, default: '16756480' },
            card:       { type: String, default: '' },
            favcomplete:{ type: String, default: '' },
            favclout:   { type: String, default: '' },
        }
    },

    premium: {
        active: { type: Boolean, default: false },
        tier: { type: Number },
        expires: { type: Date }
    },

})
module.exports = model('User', schema)