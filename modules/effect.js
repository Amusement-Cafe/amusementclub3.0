const {
    UserEffects
} = require('../collections')

const checkEffect = async () => {
    return true
}

const withUserEffects = (callback) => async (ctx, user, args) => {
    let effects = []
    return callback(ctx, user, args, effects)
}

const formatUserEffect = () => {}

const deleteUserEffect = async (query) => UserEffects.deleteOne(query)

module.exports = {
    checkEffect,
    deleteUserEffect,
    formatUserEffect,
    withUserEffects,
}