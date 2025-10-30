const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['collection', 'list'], async (ctx) => await listCollections(ctx))

registerBotCommand(['collection', 'info'], async (ctx) => await collectionInfo(ctx))

registerBotCommand(['collection', 'reset'], async (ctx) => await resetCollections(ctx))

const listCollections = async (ctx) => {}

const collectionInfo = async (ctx) => {}

const resetCollections = async (ctx) => {}