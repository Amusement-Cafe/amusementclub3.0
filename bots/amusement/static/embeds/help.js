const {globalContext: ctx} = require('../../../../utils/ctxFiller')

const main = {
    title: "Help - Main Menu",
    description: "## __Help usage__\n" +
        "Welcome to the Amusement Club help menu!\n" +
        "Below you should see a selection box with the broad help categories available. " +
        "Once you select a category, you will either be presented with a sub help menu with another selection box, or a main help embed based on the category you selected.\n" +
        "The current selection categories are:\n" +
        ">>> By default, images are displayed to show examples of things being talked about in the help menu. If you would rather not have the images, you can disable them in /preferences\n" +
        "-# If something is missing from the help menu, or something needs expanded on please report it in our discord server!",
    color: ctx.colors.green
}

const subCards = {
    title: "Help - Cards",
    description: "Cards help",
}

const subCollections = {
    title: "Help - Collections",
    description: "Collections help",
}

const subGuilds = {
    title: "Help - Guilds",
    description: "Guilds help",
}

const subTransactions = {
    title: "Help - Transactions",
    description: "Transactions help",
}

const subUser = {
    title: "Help - User",
    description: "User help",
}

const subOther = {
    title: "Help - Other",
    description: "Other help",
}

const subRules = {
    title: "Bot Rules",
    description: "Rules go here",
}

module.exports = {
    main,
    subMenus: {
        subCards,
        subCollections,
        subGuilds,
        subUser,
        subTransactions,
        subOther,
        subRules,
    },
    helpMenus: {
        subCards: {
            claims: {
                title: 'About claiming cards',
                description: 'Tomatoes'
            },
            eval: {
                title: 'a',
                description: 'a'
            },
            favlock: {
                title: 'a',
                description: 'a'
            },
            query: {
                title: 'a',
                description: 'a'
            },
            rating: {
                title: 'a',
                description: 'a'
            },
            tags: {
                title: 'a',
                description: 'a'
            },
            info: {
                title: 'a',
                description: 'a'
            },
        },
        subCollections: {
            clout: {
                title: 'a',
                description: 'a'
            },
        },
        subGuilds: {
            buildings: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            ranks: {
                title: 'a',
                description: 'a'
            },
            lock: {
                title: 'a',
                description: 'a'
            },
        },
        subTransactions: {
            sales: {
                title: 'a',
                description: 'a'
            },
            forge: {
                title: 'a',
                description: 'a'
            },
            auction: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
        },
        subUser: {
            daily: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            quests: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            inventory: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            diff: {
                title: 'a',
                description: 'a'
            },
            has: {
                title: 'a',
                description: 'a'
            },
            currencies: {
                title: 'a',
                description: 'a'
            },
            plots: {
                title: 'a',
                description: 'a'
            },
            preferences: {
                title: 'a',
                description: 'a'
            },
            profile: {
                title: 'a',
                description: 'a'
            },
            wish: {
                title: 'a',
                description: 'a'
            },
        },
        subOther: {
            store: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            items: [
                {
                    title: 'a',
                    description: 'a'
                }
            ],
            events: {
                title: 'a',
                description: 'a'
            },
        }
    }
}