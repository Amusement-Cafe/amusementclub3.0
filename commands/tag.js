const {
    cmd,
    pcmd,
} = require('../utils/cmd')

cmd(['tag', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['tag', 'one'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['tag', 'down'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['tag', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['tag', 'created'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'remove'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'restore'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'ban'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'list'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'audit'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod', 'tagmod'], ['tagmod', 'help'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['tag', 'purge', 'tag'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['tag', 'purge', 'user'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['tag', 'log', 'removed'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['tag', 'log', 'banned'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'tag command'})
}