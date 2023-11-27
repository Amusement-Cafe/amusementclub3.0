const {
    pcmd,
} = require('../utils/cmd')

pcmd(['admin', 'auditor'], ['audit', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'closed'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'complete'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'find', 'transaction'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'find', 'object'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'find', 'user'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'auction'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'warn'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'transaction'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'guild'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'user'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'report', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'report', 'two'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'report', 'three'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'report', 'four'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'auditor'], ['audit', 'report', 'five'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'audit command'})

}