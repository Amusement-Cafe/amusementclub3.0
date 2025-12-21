const UserInventory = require('../../../db/userInventory')
const _ = require('lodash')

const {
    generateNewID,
    encodeUUID
} = require("../../../utils/misc")

const getUserInventory = async (ctx, type) => {
    let userInv = await UserInventory.find({userID: ctx.user.userID})
    if (type) {
        userInv = userInv.filter(x => x.type === type)
    }
    return userInv
}

const addItem = async (ctx, item, collection) => {
    let newItem = await new UserInventory()
    newItem.id = encodeUUID(generateNewID())
    newItem.userID = ctx.user.userID
    newItem.itemID = item.itemID
    newItem.type = item.type
    newItem.acquired = new Date()
    if (item.single) {
        let col = _.sample(ctx.collections.filter(x => x.collectionID === collection || x.inClaimPool))
        if (!col)
            return ctx.send(ctx, `Something has gone wrong adding your item, please try again!`, 'red')
        newItem.collectionID = col.collectionID
    }
    if (item.requires) {
        newItem.cards = item.requires
    }
    await newItem.save()
}

const removeItem = async (ctx, item) => {
    let userItem = await UserInventory.find({userID: ctx.user.userID, itemID: item.itemID})
    if (!userItem) {
        return ctx.send(ctx, `Something has gone wrong removing your item, please try again!`, 'red')
    }
    await UserInventory.deleteOne(userItem)
}

module.exports = {
    addItem,
    getUserInventory,
    removeItem,
}