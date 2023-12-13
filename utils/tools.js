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

module.exports = {
    addTime,
    subTime,
}