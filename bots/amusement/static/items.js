const items = {
    //Tickets
    ticket1x1: {
        cost: 1,
        itemID: 'ticket1x1',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    ticket1x2: {
        cost: 1,
        itemID: 'ticket1x2',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    ticket1x3: {
        cost: 1,
        itemID: 'ticket1x3',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    ticket3x1s: {
        cost: 1,
        itemID: 'ticket3x1s',
        uses: 0,
        type: 'ticket',
        single: true,
        displayName: ''
    },
    ticket3x2s: {
        cost: 1,
        itemID: 'ticket3x2s',
        uses: 0,
        type: 'ticket',
        single: true,
        displayName: ''
    },
    ticket3x3s: {
        cost: 1,
        itemID: 'ticket3x3s',
        uses: 0,
        type: 'ticket',
        single: true,
        displayName: ''
    },
    ticket3x1r: {
        cost: 1,
        itemID: 'ticket3x1r',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    ticket3x2r: {
        cost: 1,
        itemID: 'ticket3x2r',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    ticket3x3r: {
        cost: 1,
        itemID: 'ticket3x3r',
        uses: 0,
        type: 'ticket',
        displayName: ''
    },
    //Recipes
    memoryVal: {
        cost: 1,
        itemID: 'memoryVal',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    memoryHall: {
        cost: 1,
        itemID: 'memoryHall',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    memoryXmas: {
        cost: 1,
        itemID: 'memoryXmas',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    memoryBday: {
        cost: 1,
        itemID: 'memoryBday',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    tohruGift: {
        cost: 1,
        itemID: 'tohruGift',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    cakeDay: {
        cost: 1,
        itemID: 'cakeDay',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    holyGrail: {
        cost: 1,
        itemID: 'holyGrail',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    skyFriend: {
        cost: 1,
        itemID: 'skyFriend',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    cherryBloss: {
        cost: 1,
        itemID: 'cherryBloss',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    onVictory: {
        cost: 1,
        itemID: 'onVictory',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    rulerJeanne: {
        cost: 1,
        itemID: 'rulerJeanne',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    spellCard: {
        cost: 1,
        itemID: 'spellCard',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    festiveWish: {
        cost: 1,
        itemID: 'festiveWish',
        uses: 0,
        active: false,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    enAyano: {
        cost: 1,
        itemID: 'enAyano',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    pBocchi: {
        cost: 1,
        itemID: 'pBocchi',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    spaceUnity: {
        cost: 1,
        itemID: 'spaceUnity',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    judgeDay: {
        cost: 1,
        itemID: 'judgeDay',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    claimRecall: {
        cost: 1,
        itemID: 'claimRecall',
        uses: 0,
        active: true,
        requires: [],
        type: 'recipe',
        displayName: ''
    },
    //Plot Buildings
    castle: {
        cost: 1,
        itemID: 'castle',
        uses: 0,
        type: 'blueprint',
        displayName: ''
    },
    gBank: {
        cost: 1,
        itemID: 'gbank',
        uses: 0,
        type: 'blueprint',
        displayName: ''
    },
    tavern: {
        cost: 1,
        itemID: 'tavern',
        uses: 0,
        type: 'blueprint',
        displayName: ''
    },
    smithHub: {
        cost: 1,
        itemID: 'smithhub',
        uses: 0,
        type: 'blueprint',
        displayName: ''
    },
    aucHouse: {
        cost: 1,
        itemID: 'aucHouse',
        uses: 0,
        type: 'blueprint',
        displayName: ''
    },
    //Bonus
    legendSwapper: {
        cost: 1000000000,
        itemID: 'legendSwapper',
        uses: 0,
        active: true,
        type: 'bonus',
        displayName: ''
    },
    slotUpgrade: {
        cost: 1,
        itemID: 'slotUpgrade',
        uses: 0,
        active: true,
        type: 'bonus',
        displayName: ''
    },
    effectIncrease: {
        cost: 1,
        itemID: 'effectIncrease',
        uses: 0,
        active: true,
        type: 'bonus',
        displayName: ''
    },
}

module.exports = {
    items
}