const {registerBotCommand} = require('../../../utils/commandRegistrar')


registerBotCommand(['sell', 'one'], async (ctx) => await sell(ctx))

registerBotCommand(['sell', 'many'], async (ctx) => await sell(ctx, true))

registerBotCommand(['transaction', 'confirm'], async (ctx) => await finalizeTransaction(ctx))

registerBotCommand(['transaction', 'decline'], async (ctx) => await finalizeTransaction(ctx, false))

registerBotCommand(['transaction', 'list'], async (ctx) => await listTransactions(ctx))

registerBotCommand(['transaction', 'info'], async (ctx) => await transactionInfo(ctx))

const sell = async (ctx, many = false) => {}

const finalizeTransaction = async (ctx, confirm = true) => {}

const listTransactions = async (ctx) => {}

const transactionInfo = async (ctx) => {}