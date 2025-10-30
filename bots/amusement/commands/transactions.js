const {registerBotCommand} = require('../../../utils/commandRegistrar')

const {
    createTransaction,
    completeTransaction,
    listTransactions,
} = require('../helpers/transactions')


registerBotCommand(['sell', 'one'], async (ctx) => await sell(ctx), { withCards: true })

registerBotCommand(['sell', 'many'], async (ctx) => await sell(ctx, true))

registerBotCommand(['transaction', 'confirm'], async (ctx) => await finalizeTransaction(ctx))

registerBotCommand(['transaction', 'decline'], async (ctx) => await finalizeTransaction(ctx, false))

registerBotCommand(['transaction', 'list'], async (ctx) => await listTransaction(ctx))

registerBotCommand(['transaction', 'info'], async (ctx) => await transactionInfo(ctx))

const sell = async (ctx, many = false) => {

    console.log(ctx.args)
}

const finalizeTransaction = async (ctx, confirm = true) => {}

const listTransaction = async (ctx) => {}

const transactionInfo = async (ctx) => {}