const {globalContext: ctx} = require('../../../../utils/ctxFiller')

const main = {
    title: "Help - Main Menu",
    description: "## __Help usage__\n" +
        "Welcome to the Amusement Club help menu!\n" +
        "Below you should see a selection box with the broad help categories available. " +
        "Once you select a category, you will either be presented with a sub help menu with another selection box, or a main help embed based on the category you selected.\n" +
        "By default, images are displayed to show examples of things being talked about in the help menu. If you would rather not have the images, you can disable them in /preferences",
    color: ctx.colors.green,
    image: {url: 'https://t.amu.cards/cards/astley.jpg'}
}

const subCommands = {
    title: "Help - Commands",
    description: "Commands help",
}

const subAuction = {
    title: "Help - Auctions",
    description: "Auctions help",
}

const subCards = {
    title: "Help - Cards",
    description: "Cards help",
}

const subCollections = {
    title: "Help - Collections",
    description: "Collections help",
}

const subCurrencies = {
    title: "Help - Currencies",
    description: "Currencies help",
}

const subForge = {
    title: "Help - Forge",
    description: "Forge help",
}

const subGuilds = {
    title: "Help - Guilds",
    description: "Guilds help",
}

const subItems = {
    title: "Help - Items",
    description: "Items help",
}

const subPlots = {
    title: "Help - Plots",
    description: "Plots help",
}

const subStore = {
    title: "Help - Store",
    description: "Store help",
}

module.exports = {
    main,
    subMenus: {
        subAuction,
        subCards,
        subCollections,
        subCommands,
        subCurrencies,
        subForge,
        subGuilds,
        subItems,
        subPlots,
        subStore,
    },
    helpMenus: {
        subAuction: {
            selling: {
                title: "Selling",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
            },
            listing: {
                title: "listing",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
            },
            bidding: {
                title: "bidding",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
            },
            cancelling: {
                title: "cancelling",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
            }
        },
        subCommands: {
            cardQuery: {}
        },
        subCards: {

        },
        subCollections: {

        },
        subCurrencies: {
            tomatoes: [
                {
                    title: "Tomatoes",
                    description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
                    color: ctx.colors.green,
                },
                {
                    title: "Tomatoes2",
                    description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE2",
                    color: ctx.colors.yellow,
                },
                {
                    title: "Tomatoes3",
                    description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE3",
                    color: ctx.colors.red,
                },
                {
                    title: "Tomatoes4",
                    description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE4",
                    color: ctx.colors.blue,
                }
            ],
            lemons: {
                title: "Lemons",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
                color: ctx.colors.green,

            },
            promo: {
                title: "Promo",
                description: "WEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
                color: ctx.colors.green,
            }
        },
        subForge: {

        },
        subGuilds: {

        },
        subItems: {

        },
        subPlots: {

        },
        subStore: {

        },
    }
}