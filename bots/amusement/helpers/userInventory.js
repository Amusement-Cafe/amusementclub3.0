const UserInventory = require('../../../db/userInventory')

const getUserInventory = async (ctx, type) => {
    let userInv = await UserInventory.find({userID: ctx.user.userID})
    if (type) {
        userInv = userInv.filter(x => x.type === type)
    }
    return userInv
}

const addItem = async (ctx, item) => {
    let userInv = await UserInventory.find({userID: ctx.user.userID})
    if (type) {
        userInv = userInv.filter(x => x.type === type)
    }
    return userInv
}

const removeItem = async (ctx, item) => {
    let userInv = await UserInventory.find({userID: ctx.user.userID})
    if (type) {
        userInv = userInv.filter(x => x.type === type)
    }
    return userInv
}

module.exports = {
    addItem,
    getUserInventory,
    removeItem,
}