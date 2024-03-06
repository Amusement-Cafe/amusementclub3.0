const {
    firstBy,
} = require("thenby")

const {
    bestColMatch,
} = require('./collection')

const {
    evalSort
} = require('../utils/tools')

const parseArgs = (ctx, user, options) => {
    let query = {
        cols: [],
        tags: [],
        userIDs: [],
    }

    if (options.user_id)
        query.userIDs.push(options.user_id)

    if (options.tag)
        query.tags.push(options.tag.replace(/\W/gi, '_'))

    let forgeArgs1, forgeArgs2
    Object.entries(options).forEach(([name, value]) => {
        switch (name) {
            case 'amount': query.amount = value; break;
            case 'anilist_link': query.anilistLink = value; break;
            case 'auction_id': query.auctionID = value; break;
            case 'auctions': query.auctions = value; break;
            case 'author_id': query.author = value; break;
            case 'bid': query.bid = value; break;
            case 'boost_id': query.boostID = value; break;
            case 'booru_id': query.booruID = value; break;
            case 'building': query.building = value; break;
            case 'card_id': query.cardID = value; break;
            case 'card_query': query.cardQuery = parseCardArgs(ctx, user, value); break;
            case 'card_query_1': forgeArgs1 = parseCardArgs(ctx, user, value); query.cardQuery1 = value; break;
            case 'card_query_2': forgeArgs2 = parseCardArgs(ctx, user, value); query.cardQuery2 = value; break;
            case 'claim_id': query.claimID = value; break;
            case 'clouted': query.clouted = value; break;
            case 'collection': query.cols.push(value.split(' ').map(y => bestColMatch(ctx, y.replace('-', '')))); query.colQuery = value; break;
            case 'completed': query.completed = value; break;
            case 'count': query.count = value; break;
            case 'effect_name': query.effect = value; break;
            case 'extra_arguments': query.extraArgs = value; break;
            case 'from': query.from = value; break;
            case 'guild_id': query.guildID = value; break;
            case 'hero': query.hero = value; break;
            case 'interact_option': query.option = value; break;
            case 'inventory_item': query.inventoryItem = value; break;
            case 'item_id': query.itemID = value; break;
            case 'lift': query.lift = value; break;
            case 'me': query.me = value; break;
            case 'message': query.message = value; break;
            case 'missing': query.missing = value; break;
            case 'notification_option': query.option = value; break;
            case 'pending': query.pending = value; break;
            case 'plot_number': query.plot = value; break;
            case 'price': query.price = value; break;
            case 'profile_option': query.option = value; break;
            case 'promo': query.promo = value; break;
            case 'quest_number': query.questNum = value; break;
            case 'rating': query.rating = value; break;
            case 'received': query.received = value; break;
            case 'role':
            case 'roles': query.roles = value; break;
            case 'slot_number': query.slot = value; break;
            case 'sort_completion': query.sortComplete = value; break;
            case 'source': query.source = value; break;
            case 'sourced': query.sourced = value; break;
            case 'store_number': query.store = value; break;
            case 'tax_percentage': query.tax = value; break;
            case 'time_length': query.timeLength = value; break;
            case 'title': query.title = value; break;
            case 'to': query.to = value; break;
            case 'transaction_id': query.transactionID = value; break;
            case 'unlocked': query.any = value; break;
            case 'user_ids': query.users = value; break;
            default:
                break
        }
    })



    return query
}

const parseCardArgs = (ctx, user, cardArgs) => {
    let query = {
        antiCols: [],
        antiLevels: [],
        antiTags: [],
        cols: [],
        filters: [],
        keywords: [],
        levels: [],
        sources: [],
        tags: [],
    }

    const args = cardArgs.split(' ').map(x => x.toLowerCase())
    let sort

    args.map(x => {
        let subStr = x.substring(1)
        const start = x[0]

        if (x === '.') {
            query.lastCard = true
        }
        else if (start.match(/(<|>|=)/)) {
            const lessThan = start === '<'
            switch (subStr) {
                case 'date':
                    sort = sortBuilder((a, b) => a.obtained - b.obtained, lessThan, sort)
                    query.userQuery = true
                    break;
                case 'amount':
                    sort = sortBuilder((a, b) => a.amount - b.amount, lessThan, sort)
                    break;
                case 'name':
                    sort = sortBuilder((a, b) => a.name - b.name, lessThan, sort)
                    break;
                case 'star':
                    sort = sortBuilder((a, b) => a.level - b.level, lessThan, sort)
                    break;
                case 'col':
                    sort = sortBuilder((a, b) => a.col - b.col, lessThan, sort)
                    break;
                case 'eval':
                    sort = sortBuilder((a, b) => evalSort(ctx, a, b), lessThan, sort)
                    break;
                case 'rating':
                    sort = sortBuilder((a, b) => (a.rating || 0) - (b.rating || 0), lessThan, sort)
                    break;
                default:
                    const isEquals = x[1] === '='
                    if (isEquals)
                        subStr = x.substring(2)
                    switch(start) {
                        case '>' : query.filters.push(c => isEquals? c.amount >= subStr: c.amount > subStr); query.userQuery = true; break
                        case '<' : query.filters.push(c => isEquals? c.amount <= subStr: c.amount < subStr); query.userQuery = true; break
                        case '=' : query.filters.push(c => c.amount == subStr); query.userQuery = true; break
                    }

            }
        }
        else if (start.match(/(-|!)/)) {
            if (start === '!' && subStr[1] === '#') {
                query.antiTags.push(subStr.substring(1))
            } else {
                const flag = start === '-'
                switch (subStr) {
                    case 'gif':
                        query.filters.push(card => card.animated === flag)
                        break;
                    case 'multi':
                        query.filters.push(card => flag? card.amount > 1: card.amount === 1)
                        query.userQuery = true
                        break;
                    case 'fav':
                        query.filters.push(card => card.fav === flag)
                        query.fav = flag
                        query.userQuery = true
                        break;
                    case 'lock':
                    case 'locked':
                        query.filters.push(card => card.locked === flag)
                        query.locked = flag
                        query.userQuery = true
                        break;
                    case 'new':
                        query.filters.push(card => flag? card.obtained > user.lastDaily: card.obtained <= user.lastDaily)
                        query.userQuery = true
                        break;
                    case 'rated':
                        query.filters.push(card => card.rating > 0 === flag)
                        query.userQuery = true
                        break;
                    case 'wish':
                        query.wish = flag? 1: 2
                        break;
                    case 'promo':
                        const promoCols = bestColMatch(ctx, subStr)
                        flag? promoCols.map(x => query.cols.push(x.id)): promoCols.map(x => query.antiCols.push(x.id))
                        break;
                    case 'diff':
                    case 'miss':
                        query.diff = flag? 1: 2
                        break;
                    default:
                        const parsedInt = parseInt(subStr)
                        if (!isNaN(parsedInt))
                            flag? query.levels.push(parsedInt): query.antiLevels.push(parsedInt)
                        else
                            flag? query.cols.push(bestColMatch(ctx, subStr)[0].id): query.antiCols.push(bestColMatch(ctx, subStr)[0].id)

                }
            }
        }
        else if (start === '#') {
            query.tags.push(subStr.replace(/\W/gi, '_'))
        }
        else if (start === '$') {
            query.sources.push(subStr)
        }
        else {
            query.keywords.push(x)
        }
    })

    if(query.cols.length > 0) query.filters.push(c => query.cols.includes(c.col))
    if(query.levels.length > 0) query.filters.push(c => query.levels.includes(c.level))
    if(query.antiCols.length > 0) query.filters.push(c => !query.antiCols.includes(c.col))
    if(query.antiLevels.length > 0) query.filters.push(c => !query.antiLevels.includes(c.level))
    if(query.keywords.length > 0)
        query.filters.push(c => (new RegExp(`(_|^)${query.keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('.*')}`, 'gi')).test(c.name))

    if (!sort)
        query.sort = firstBy((a, b) => b.level - a.level).thenBy("col").thenBy("name")
    else
        query.sort = sort


    return query
}

const sortBuilder = (sortBy, direction, startSort) => {
    if (startSort)
        return startSort.thenBy(sortBy, {direction: direction? "asc": "desc"})
    return firstBy(sortBy, {direction: direction? "asc": "desc"})
}


module.exports = {
    parseArgs
}