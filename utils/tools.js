/*
Returns a new Date with the specified addition required, without mutating the given date
 */
const addTime = (date, count, units) => {
    let newDate = new Date(date)
    switch (units) {
        case 'year':
        case 'years':
            newDate = newDate.setFullYear(newDate.getFullYear() + count)
            break;
        case 'month':
        case 'months':
            newDate = newDate.setMonth(newDate.getMonth() + count)
            break;
        case 'day':
        case 'days':
            newDate = newDate.setDate(newDate.getDate() + count)
            break;
        case 'hour':
        case 'hours':
            newDate = newDate.setHours(newDate.getHours() + count)
            break;
        case 'minute':
        case 'minutes':
            newDate = newDate.setMinutes(newDate.getMinutes() + count)
            break;
        case 'second':
        case 'seconds':
            newDate = newDate.setSeconds(newDate.getSeconds() + count)
            break;
        case 'millisecond':
        case 'milliseconds':
            newDate = newDate.setMilliseconds(newDate.getMilliseconds() + count)
            break;
    }
    return new Date(newDate)
}

/*
Returns a new Date with the specified subtraction required, without mutating the given date
 */
const subTime = (date, count, units) => {
    let newDate = new Date(date)
    switch (units) {
        case 'year':
        case 'years':
            newDate = newDate.setFullYear(newDate.getFullYear() - count)
            break;
        case 'month':
        case 'months':
            newDate = newDate.setMonth(newDate.getMonth() - count)
            break;
        case 'day':
        case 'days':
            newDate = newDate.setDate(newDate.getDate() - count)
            break;
        case 'hour':
        case 'hours':
            newDate = newDate.setHours(newDate.getHours() - count)
            break;
        case 'minute':
        case 'minutes':
            newDate = newDate.setMinutes(newDate.getMinutes() - count)
            break;
        case 'second':
        case 'seconds':
            newDate = newDate.setSeconds(newDate.getSeconds() - count)
            break;
        case 'millisecond':
        case 'milliseconds':
            newDate = newDate.setMilliseconds(newDate.getMilliseconds() - count)
            break;
    }
    return new Date(newDate)
}

module.exports = {
    addTime,
    subTime,
}