const {firstBy} = require('thenby')

const getCommandOptions = async (ctx, user) => {
    let args = {
        cols: [],
        tags: [],
        userIDs: [],
        cardQuery: {
            sort: firstBy((a, b) => b.rarity - a.rarity).thenBy('collectionID').thenBy('cardName'),
        }
    }

    Object.entries(ctx.options).forEach(([name, value]) => {
        console.log(name)
        console.log(value)
        switch (name) {
            case 'collection': args.colQuery = value; break;
            case 'promo': args.promo = value; break;
        }
    })

    return args
}


module.exports = {
    getCommandOptions
}