const {
    pcmd,
} = require('../utils/cmd')

pcmd(['admin', 'mod'], ['sudo', 'summon'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'eval', 'reset'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'eval', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'eval', 'force'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'tomatoes'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'vials'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'lemons'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'card'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'cards'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'remove', 'card'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'help'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'add', 'role'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'add', 'owner'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'remove', 'role'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'remove', 'owner'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'inrole'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'stress'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'guild', 'lock'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'guild', 'unlock'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'reset', 'daily'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'hero', 'score'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'guild', 'herocheck'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'reverse', 'transaction'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'reverse', 'auction'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'crash'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'refresh', 'global'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'refresh', 'admin'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'transfer'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'embargo'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'wip'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'auclock'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'announce'], async (ctx, user, args) => await defaultFunction(ctx, user, args), {deferless: true})

pcmd(['admin'], ['sudo', 'lead', 'lemons'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'lead', 'tomatoes'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'lead', 'vials'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

pcmd(['admin'], ['sudo', 'lead', 'clout'], async (ctx, user, args) => await defaultFunction(ctx, user, args))


const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'admin command'})
}