const {
    evalCard
} = require('../modules/eval')

/*
Returns a new Date with the specified addition required, without mutating the given date
 */
const addTime = (date, count, units) => {
    let newDate = new Date(date)
    switch (units) {
        case 'year':
        case 'years':
            newDate.setFullYear(newDate.getFullYear() + count)
            break;
        case 'month':
        case 'months':
            newDate.setMonth(newDate.getMonth() + count)
            break;
        case 'day':
        case 'days':
            newDate.setDate(newDate.getDate() + count)
            break;
        case 'hour':
        case 'hours':
            newDate.setHours(newDate.getHours() + count)
            break;
        case 'minute':
        case 'minutes':
            newDate.setMinutes(newDate.getMinutes() + count)
            break;
        case 'second':
        case 'seconds':
            newDate.setSeconds(newDate.getSeconds() + count)
            break;
        case 'millisecond':
        case 'milliseconds':
            newDate.setMilliseconds(newDate.getMilliseconds() + count)
            break;
    }
    return newDate
}

/*
Returns a new Date with the specified subtraction required, without mutating the given date
 */
const subTime = (date, count, units) => {
    let newDate = new Date(date)
    switch (units) {
        case 'year':
        case 'years':
            newDate.setFullYear(newDate.getFullYear() - count)
            break;
        case 'month':
        case 'months':
            newDate.setMonth(newDate.getMonth() - count)
            break;
        case 'day':
        case 'days':
            newDate.setDate(newDate.getDate() - count)
            break;
        case 'hour':
        case 'hours':
            newDate.setHours(newDate.getHours() - count)
            break;
        case 'minute':
        case 'minutes':
            newDate.setMinutes(newDate.getMinutes() - count)
            break;
        case 'second':
        case 'seconds':
            newDate.setSeconds(newDate.getSeconds() - count)
            break;
        case 'millisecond':
        case 'milliseconds':
            newDate.setMilliseconds(newDate.getMilliseconds() - count)
            break;
    }
    return newDate
}

const makePages = (array, split = 10, maxCharacters = 4096) => {
    let count = 0, page = 0
    const pages = [""]
    array.map(x => {
        const entry = `${x}\n`

        if(count >= split || pages[page].length + entry.length > maxCharacters) {
            page++
            count = 1
            pages[page] = entry
        } else {
            count++
            pages[page] += entry
        }
    })

    return pages
}

const propertySort = (itemA, itemB, property = "name") => {
    if(itemA[property] < itemB[property])
        return -1
    if(itemA[property] > itemB[property])
        return 1
    return 0
}

const evalSort = (ctx, a, b) => {
    if(evalCard(ctx, a) > evalCard(ctx, b))return 1
    if(evalCard(ctx, a) < evalCard(ctx, b))return -1
    return 0
}

const formatDateLong= (date) => {
    return `<t:${Math.floor(date.getTime() / 1000)}:D>`
}

const formatDateTimeLong= (date) => {
    return `<t:${Math.floor(date.getTime() / 1000)}:F>`
}

const formatDateTimeRelative = (date) => {
    return `<t:${Math.floor(date.getTime() / 1000)}:R>`
}

module.exports = {
    addTime,
    evalSort,
    formatDateLong,
    formatDateTimeLong,
    formatDateTimeRelative,
    makePages,
    propertySort,
    subTime,
}