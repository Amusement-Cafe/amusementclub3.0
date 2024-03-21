const {
    cmd,
} = require("../utils/cmd")

cmd(['effect', 'info'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['effect', 'list', 'actives'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['effect', 'use'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

cmd(['effect', 'list', 'passives'], async (ctx, user, args) => await defaultFunction(ctx, user, args))

const defaultFunction = async (ctx, user, args) => {
    await ctx.interaction.createFollowup({content: 'hero command'})
}