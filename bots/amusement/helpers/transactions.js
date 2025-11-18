const Transaction = require('../../../db/transaction')
const {generateNewID} = require("../../../utils/misc");


const createTransaction = async (ctx, userCards, toID = 'bot', cost) => {
    if (toID !== 'bot' || !toID) {
        toID = toID.userID
    }




    let trans = new Transaction()
    trans.transactionID = generateNewID()
    trans.fromID = ctx.user.ID
    trans.toID = toID
    trans.status = 'pending'
    trans.guildID = ctx.guildID? ctx.guildID : 'DM'
    trans.cost = cost
    trans.cardIDs = userCards.map(x => x.id)
    trans.dateCreated = new Date()
    await trans.save()

    return {success: true, transactionID: trans.transactionID }
}

const completeTransaction = async (ctx, decline = false, parent = true) => {
    ctx.arguments = ctx.arguments.replaceAll(/O/g, "-")
    const transaction = await Transaction.findOne({transactionID: ctx.arguments})
    if (!transaction || transaction.status === 'completed') {
        return ctx.send(ctx, {
            embed: {
                description: `Transaction cannot be found or it is already completed!`,
                color: ctx.colors.red
            },
            parent
        })
    }
    if (decline) {
        transaction.status = 'completed'
        await transaction.save()
        return ctx.send(ctx, {
            embed: {
                description: `The transaction to ${transaction.toID === 'bot'? 'bot': `<@${transaction.toID}>`} has been declined.`,
                color: ctx.colors.red
            },
            parent
        })
    }
}

const listTransactions = async () => {

}

module.exports = {
    createTransaction,
    completeTransaction,
    listTransactions,
}