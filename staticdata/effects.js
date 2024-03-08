const _ = require("lodash")

const passiveEffects = [
    {
        id: 'cakeday',
        name: 'Cake Day',
        effectDescription: 'Grants +100 tomatoes in your daily for every normal claim in the day prior',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true,
        animated: true
    },
    {
        id: 'cherrybloss',
        name: 'Cherry Blossoms',
        effectDescription: 'Reduces `/forge` cost by 50%',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'festivewish',
        name: 'Festival of Wishes',
        effectDescription: 'Being Removed',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'holygrail',
        name: 'The Holy Grail',
        effectDescription: 'Grants 25% extra vials when liquefying 1 and 2-star cards',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true,
        animated: true
    },
    {
        id: 'onvictory',
        name: 'Onwards To Victory',
        effectDescription: 'Literally useless',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'rulerjeanne',
        name: 'The Ruler Jeanne',
        effectDescription: 'Reduces time to next `/daily` by 20%',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'skyfriend',
        name: 'Skies Of Friendship',
        effectDescription: 'Grants 10% of winning auction amount back',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'spellcard',
        name: 'Impossible Spell Card',
        effectDescription: 'Reduces active effect cooldown by 40%',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
    {
        id: 'tohrugift',
        name: 'Gift From Tohru',
        effectDescription: 'Guarantees a 3-star card with you first claim per day',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: true
    },
]


const activeEffects = [
    {
        id: 'claimrecall',
        name: 'Claim Recall',
        effectDescription: 'Claim cost gets recalled by 4 claims, as if they never happened',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 15,
        use: async (ctx, user) => {}
    },
    {
        id: 'enayano',
        name: 'Enlightened Ayano',
        effectDescription: 'Completes tier 1 quest when used',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 20,
        use: async (ctx, user) => {}
    },
    {
        id: 'judgeday',
        name: 'The Judgment Day',
        effectDescription: 'Grants effect of almost any usable card',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 48,
        use: async (ctx, user, args) => {}
    },
    {
        id: 'memorybday',
        name: 'Memories of Birthdays Past',
        effectDescription: 'Gives a random card from Birthday promos',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 120,
        use: async (ctx, user) => {}
    },
    {
        id: 'memoryhall',
        name: 'Memories of Halloween Frights',
        effectDescription: 'Gives a random card from Halloween promos',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 120,
        use: async (ctx, user) => {}
    },
    {
        id: 'memoryval',
        name: 'Memories of Valentines Day',
        effectDescription: 'Gives a random card from Valentines promos',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 120,
        use: async (ctx, user) => {}
    },
    {
        id: 'memoryxmas',
        name: 'Memories of Christmas Cheer',
        effectDescription: 'Gives a random 1-3★ card from Christmas promos',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 120,
        use: async (ctx, user) => {}
    },
    {
        id: 'pbocchi',
        name: 'Powerful Bocchi',
        effectDescription: 'Generates tier 1 quest when used',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 32,
        use: async (ctx, user) => {}
    },
    {
        id: 'spaceunity',
        name: 'The Space Unity',
        effectDescription: 'Gives random unique card from non-promo collection (make 50-50 or something)',
        effectLasts: 0,
        itemDescription: '',
        itemRecipe: [],
        itemPrice: 0,
        shortDescription: ``,
        passive: false,
        cooldown: 40,
        use: async (ctx, user, args) => {}
    },
]


module.exports = _.flatten([passiveEffects, activeEffects])
