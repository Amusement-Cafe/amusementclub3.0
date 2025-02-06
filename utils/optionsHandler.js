const {firstBy} = require('thenby')
const {distance, closest} = require('fastest-levenshtein')
const _ = require("lodash");

const getCommandOptions = async (ctx, user) => {
    let args = {
        cols: [],
        tags: [],
        userIDs: [],
        cardQuery: {
            sort: firstBy((a, b) => b.rarity - a.rarity).thenBy('collectionID').thenBy('cardName'),
        }
    }
    if (ctx.options) {
        Object.entries(ctx.options).forEach(([name, value]) => {
            switch (name) {
                case 'alias': args.aliases = value.split(' '); break;
                case 'collection':
                    args.cols.push(value.split(' ').map(x => {
                        let close = closest(x, _.flattenDeep(ctx.collections.map(y => y.aliases)))

                        if (distance(x, close) <= 3) {
                            return close
                        }
                        return false
                    }));
                    args.colQuery = value;
                    break;
                case 'promo': args.promo = value; break;
                case 'remove': args.remove = value; break;
            }
        })
    }

    args.cols = _.flattenDeep(args.cols).filter(x => x)
    return args
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
                    sort = sortBuilder((a, b) => a.cardName - b.cardName, lessThan, sort)
                    break;
                case 'star':
                    sort = sortBuilder((a, b) => a.level - b.level, lessThan, sort)
                    break;
                case 'col':
                    sort = sortBuilder((a, b) => a.collectionID - b.collectionID, lessThan, sort)
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

    if(query.cols.length > 0) query.filters.push(c => query.cols.includes(c.collectionID))
    if(query.levels.length > 0) query.filters.push(c => query.levels.includes(c.level))
    if(query.antiCols.length > 0) query.filters.push(c => !query.antiCols.includes(c.collectionID))
    if(query.antiLevels.length > 0) query.filters.push(c => !query.antiLevels.includes(c.level))
    if(query.keywords.length > 0)
        query.filters.push(c => (new RegExp(`(_|^)${query.keywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('.*')}`, 'gi')).test(c.cardName))

    if (!sort)
        query.sort = firstBy((a, b) => b.level - a.level).thenBy("collectionID").thenBy("cardName")
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
    getCommandOptions
}