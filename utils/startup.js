const Filter = require("bad-words")

const {
    send,
    sendInteraction,
    sendModal,
} = require('../modules/messages')

const filter = new Filter()
const cardInfos = []


const toObj = (user, str, clr = 2067276) => {
    if(typeof str === 'object') {
        str.description = `**${user.username}**, ${str.description}`
        str.color = clr
        return str
    }

    return { description: `**${user.username}**, ${str}`, color: clr }
}

const direct = async (ctx, user, str, clr = 'default') => {
    try {
        const ch = await ctx.bot.rest.users.createDM(user.userID)
        return ch.createMessage({embeds: [toObj(user, str, ctx.colors[clr])]}).catch(e => console.log(e))
    } catch (e) {console.log(e)}
}
//
// const fillCardOwnerCount = async (carddata) => {
//     const infos = await meta.fetchAllInfos()
//     infos.map(x => {
//         cardInfos[x.id] = x
//     })
// }

const fillCardData = (carddata, config) => {
    return carddata.map((x, i) => {
        const col = config.data.collections.filter(y => y.id == x.col)[0]
        const ext = x.animated? 'gif' : (col.compressed? 'jpg' : 'png')
        const basePath = `/${col.promo? 'promo':'cards'}/${col.id}/${x.level}_${x.name}.${ext}`
        x.url = config.links.baseurl + basePath
        x.shorturl = config.links.shorturl + basePath
        x.id = i

        if(x.added)
            x.added = Date.parse(x.added)

        return x
    })
}

const calculateDistribution = (cards, collections) => {
    const claimableCount = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    }
    cards.map(x => {
        const col = collections.filter(y => y.id == x.col)[0]
        if (!col.promo && (!col.rarity || col.rarity > 0)) {
            claimableCount[x.level]++
            claimableCount[0]++
        }
    })
    return claimableCount
}

const startup = async (config) => {
    let sauce
    filter.addWords(...config.data.bannedwords)
    config.cards = fillCardData(config.data.cards, config)
    // await fillCardOwnerCount(cards)

    let mixpanel = {
        track: () => { }
    }

    // if(config.sourcing.sauceNaoToken) {
    //     sauce = sagiri(config.sourcing.sauceNaoToken, {
    //         mask: [9],
    //         results: 2,
    //     })
    // }

    // if(config.analytics.mixpanel) {
    //     try {
    //         mixpanel = Mixpanel.init(config.analytics.mixpanel)
    //     } catch(e) {
    //         console.log(e)
    //     }
    // }

    return {
        cards: config.cards, /* data with cards */
        collections: config.data.collections, /* data with collections */
        adminGuildID: config.bot.adminGuildID,
        promos: config.data.promos.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})),
        boosts: config.data.boosts.map( x => Object.assign({}, x, {starts: Date.parse(x.starts), expires: Date.parse(x.expires)})),
        autoAuction: config.auction.auto,
        auctionFeePercent: config.auction.auctionFeePercent,
        filter,
        symbols: config.symbols,
        baseurl: config.links.baseurl,
        links: config.links,
        invite: config.bot.invite,
        prefix: config.bot.prefix,
        uniqueFrequency: config.effects.uniqueFrequency,
        eval: config.evals,
        cafe: 'https://discord.gg/xQAxThF', /* support server invite */
        config,
        colors: config.colors,
        rng: config.rng,
        guildLogChannel: config.channels.guildLog,
        reportChannel: config.channels.report,
        settings: {
            wip: config.bot.maintenance,
            wipMsg: 'bot is currently under maintenance. Please check again later |ω･)ﾉ',
            aucLock: config.auction.lock
        },
        // help: require('../staticdata/help'),
        // audithelp: require('../staticdata/audithelp'),
        // items: require('../staticdata/items'),
        // achievements: require('../staticdata/achievements'),
        // quests: require('../staticdata/quests'),
        // effects: require('../staticdata/effects'),
        // slashCmd: require('../staticdata/slashcommands'),
        // adminCmd: require('../staticdata/adminslashcommands'),
        distribution: calculateDistribution(config.cards, config.data.collections),
        direct,
        send,
        cardInfos,
        sauce,
        sendInteraction,
        sendModal,
        toObj,
        mixpanel
    }

}

module.exports = {
    direct,
    startup,
    toObj,
    fillCardData
}