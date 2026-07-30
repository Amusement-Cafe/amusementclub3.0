const {globalContext: ctx} = require('../../../../utils/ctxFiller')

const main = {
    title: "Help - Main Menu",
    description: "## __Help usage__\n" +
        "Welcome to the Amusement Club help menu!\n" +
        "Below you should see a selection box with the broad help categories available. " +
        "Once you select a category, you will either be presented with a sub help menu with another selection box, or a main help embed based on the category you selected.\n" +
        "> By default, images are displayed to show examples of things being talked about in the help menu. If you would rather not have the images, you can disable them in /preferences\n" +
        "-# If something is missing from the help menu, or something needs expanded on please report it in our discord server!\n" +
        "The current selection categories are:\n",
    fields: [
        {
            name: 'Rules',
            value: 'Selecting this category will display the bot rules. By using the bot you agree to abide by these rules.',
            inline: false
        },
        {
            name: 'Cards',
            value: 'Providing extra details on many commands related to cards.',
            inline: true
        },
        {
            name: 'Collections',
            value: 'Providing extra details on collections.',
            inline: true
        },
        {
            name: 'Guilds',
            value: 'Providing extra details on guilds.',
            inline: true
        },
        {
            name: 'Transactions',
            value: 'Providing extra details on transactions such as auctions, sales, and forging.',
            inline: true
        },
        {
            name: 'User',
            value: 'Providing extra details on user commands such as daily, quests, inventory, and preferences.',
            inline: true
        },
        {
            name: 'Other',
            value: 'Selecting this category will display the "other" help menu. A collection of commands or features that don\'t directly relate to a category above',
            inline: true
        },
        {
            name: 'Links',
            value: `[Source Code](https://github.com/Amusement-Cafe/amusementclub3.0) | [Support Development & Hosting](https://ko-fi.com/amusement)`,
            inline: false
        }
    ],
    footer: {
        text: `Amusement Club 3.0 | developed by @demonic.moo @noxc`
    },
    color: ctx.colors.green
}

const subCards = {
    title: "Help - Cards",
    description: "Everything related to interacting with your cards.",
}

const subCollections = {
    title: "Help - Collections",
    description: "Thematic collections of cards.",
}

const subGuilds = {
    title: "Help - Guilds",
    description: "Discord servers act as guilds with their own land plots.",
}

const subTransactions = {
    title: "Help - Transactions",
    description: "Learn how to trade, sell, auction, and forge cards.",
}

const subUser = {
    title: "Help - User",
    description: "Information about your progression, balance, inventory, and profile settings.",
}

const subOther = {
    title: "Help - Other",
    description: "Other game concepts like the store, items, effects, and heroes.",
}

const subRules = {
    title: "Bot Rules",
    description: "1. No alternative accounts for farming.\n2. No exploiting bugs or glitches; report them immediately.\n3. Respect the Terms of Service.\n4. No macroing or auto-typing tools for commands.\nFailure to abide by these rules may result in an embargo or permanent ban.",
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
                title: 'Claiming Cards',
                description: 'Use `/claim` to draw 1–20 random cards. Each claim costs tomatoes (🍅), with the price scaling up based on how many claims you have made today (resets with `/daily`). You can also specify options like `count`, `any`, and `promo`.'
            },
            eval: {
                title: 'Card Valuation (Eval)',
                description: 'The `/eval` command calculates a card\'s dynamic market value in 🍅. The value fluctuates based on factors like age decay, hoarding ratio, supply dilution, auction history, and wishlist demand.'
            },
            favlock: {
                title: 'Favorites & Locks',
                description: '**Favorites:** Mark cards as favorites with `/fav`. Favorited cards cannot be sold and are hidden from `/diff` unless the `-fav` query is used.\n**Locks:** Use `/lock` on cards to completely prevent forging, selling, and trading.'
            },
            query: {
                title: 'Card Queries (Summon & Search)',
                description: 'Use `/summon` to display a random owned card matching your query. You can filter by collection, rarity, name, and other properties.'
            },
            rating: {
                title: 'Card Ratings',
                description: 'Community rating system. You can rate cards out of 10. The overall average rating is displayed on the card info.'
            },
            tags: {
                title: 'Tagging Cards',
                description: 'Use `/tag` to create and apply custom descriptive tags to cards. Tags can be upvoted or downvoted and allow you to filter cards by specific content descriptors. Creating a tag that exists, will instead upvote it.'
            },
            info: {
                title: 'Card Information',
                description: 'Use `/info` to display detailed stats about a card. This includes its rarity, collection, current market value (eval), rating, ownership count, and metadata like its artist or source.'
            },
        },
        subCollections: {
            clout: {
                title: 'Collection Clout & Completion',
                description: 'Browse collections using `/collections`.\n**Completion:** Own at least one copy of every card in a collection.\n**Clouted:** Awarded if you reset the collection after completing it.'
            },
        },
        subGuilds: {
            buildings: [
                {
                    title: 'Land Plots & Buildings',
                    description: 'Use `/plot list` and `/plot buy` to purchase land plots in your guild. You can construct buildings that passively generate lemons (🍋) over time. Buildings can be upgraded with blueprints or demolished.'
                },
                {
                    title: 'Lemons 🍋',
                    description: 'Lemons are the primary guild currency. Collect them with `/plot collect`. They are used to buy blueprints and upgrade guild buildings.'
                }
            ],
            ranks: {
                title: 'Guild Treasury & Roles',
                description: 'Use `/guild` to view the guild\'s treasury (🍅 and 🍋). Server admins can assign Managers to administer guild settings.'
            },
            lock: {
                title: 'Guild Taxes & Locks',
                description: 'Managers can set a **Guild Tax** (adds a percentage to claim costs that goes to the treasury) and **Collection Lock** (restricts claims in the server to a specific collection).'
            },
        },
        subTransactions: {
            sales: {
                title: 'Selling Cards',
                description: 'Use `/sell one` or `/sell many` to exchange cards for 🍅. You can sell cards directly to other players, or to the bot for their current Eval price.'
            },
            forge: {
                title: 'Forging',
                description: 'Use `/forge` to combine two cards of the SAME rarity to produce a new random card of equal rarity. Forging costs 🍅.'
            },
            auction: [
                {
                    title: 'Auctions',
                    description: 'Use `/auction sell` to list a card on the global market for up to 6 hours. Listing a card requires a fee equal to 10% of your starting price.'
                },
                {
                    title: 'Bidding (Vickrey)',
                    description: 'Auctions are Vickrey-style (blind). You place hidden bids using 🍅, and when the auction ends, the highest bidder wins but only pays the amount of the second-highest bid.'
                }
            ],
        },
        subUser: {
            daily: [
                {
                    title: 'Daily Rewards',
                    description: 'Use `/daily` every 20 hours to claim 750🍅, receive 2 new quests, and reset your daily claim cost multiplier back to 50🍅. Consecutive claims build a streak for better rewards, but missing a day resets it.'
                }
            ],
            quests: [
                {
                    title: 'Quests & Achievements',
                    description: 'Use `/quests` to view active objectives. Quest difficulty depends on your level. **Note:** Uncompleted quests are overwritten when you claim your next `/daily`.\nUse `/achievements` to view unlocked milestones, which can be used as profile titles.'
                }
            ],
            inventory: [
                {
                    title: 'Inventory',
                    description: 'Use `/inventory` to check your stored items such as Tickets (redeemable for cards), Recipes, Blueprints, and gameplay Bonuses.'
                }
            ],
            diff: {
                title: 'Diff & Miss',
                description: 'Use `/diff` to compare your collection with another user to find missing cards for trading. Use `/miss` to see which cards you are missing from specific collections.'
            },
            has: {
                title: 'Check Ownership',
                description: 'Use `/has` to quickly check if a specific user owns a certain card.'
            },
            currencies: {
                title: 'Currencies & Balance',
                description: 'Use `/balance` to check your current wealth:\n🍅 **Tomatoes**: Primary currency for claims, forging, store, and auctions.\n🧪 **Vials**: Obtained from liquefying cards, used for /draw.\n🍋 **Lemons**: Guild currency for plots.\n✨ **Promo**: Event-only currency.'
            },
            plots: {
                title: 'Plots',
                description: 'See the Guilds > Buildings category for more information on managing your land plots.'
            },
            preferences: {
                title: 'User Preferences',
                description: 'Use `/preferences` to manage notification settings, set your profile color and bio, and toggle display options like showing images in help menus.'
            },
            profile: {
                title: 'Profile & Stats',
                description: 'Use `/profile` to show off your level, bio, stats, and favorite cards.\nUse `/stats` to view detailed metrics broken down by daily, weekly, monthly, and all-time.'
            },
            wish: {
                title: 'Wishlist',
                description: 'Add cards to your wishlist. A higher global wishlist count for a card increases its market demand and Eval price.'
            },
        },
        subOther: {
            store: [
                {
                    title: 'The Store',
                    description: 'Use `/store` to interactively purchase tickets, bonuses, recipes, and building blueprints (unlocked at level 20) using 🍅.'
                }
            ],
            items: [
                {
                    title: 'Tickets & Recipes',
                    description: 'Tickets can be redeemed for cards (random or targeted by rarity). Recipes are crafting ingredients for special operations.'
                }
            ],
            events: {
                title: 'Effects & Heroes',
                description: '**Effects:** Use `/effect` to list and apply time-limited buffs (recipes). Passive effects attach to your Hero.\n**Heroes:** Community-submitted characters you can follow. You can submit your own Hero at level 10. Set your active Hero in `/profile`.'
            },
        }
    }
}