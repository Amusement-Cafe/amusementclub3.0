const {registerBotCommand} = require('../../../utils/commandRegistrar')

registerBotCommand(['sudo', 'refresh', 'global'], async (ctx) => await refresh(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'refresh', 'guild'],async (ctx) => await refresh(ctx, false), {perms: ['admin']})

registerBotCommand(['sudo', 'summon'], async (ctx) => await summon(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'tomatoes'], async (ctx) => await addCurrency(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'lemons'], async (ctx) => await addCurrency(ctx, 'lemons'), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'card'], async (ctx) => await addCards(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'cards'], async (ctx) => await addCards(ctx, true), {perms: ['admin']})

registerBotCommand(['sudo', 'remove', 'card'], async (ctx) => await removeCards(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'remove', 'cards'], async (ctx) => await removeCards(ctx, true), {perms: ['admin']})

registerBotCommand(['sudo', 'help'], async (ctx) => await help(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'role'], async (ctx) => await manageRoles(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'remove', 'role'], async (ctx) => await manageRoles(ctx, true), {perms: ['admin']})

registerBotCommand(['sudo', 'add', 'owner'], async (ctx) => await modifyGuildOwner(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'remove', 'owner'], async (ctx) => await modifyGuildOwner(ctx, true), {perms: ['admin']})

registerBotCommand(['sudo', 'inrole'], async (ctx) => await usersInRole(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'guild', 'lock'], async (ctx) => await modifyGuildLocks(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'guild', 'unlock'], async (ctx) => await modifyGuildLocks(ctx, true), {perms: ['admin']})

registerBotCommand(['sudo', 'reset', 'daily'], async (ctx) => await dailyReset(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'reverse', 'transaction'], async (ctx) => await reverseTransaction(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'reverse', 'auction'], async (ctx) => await reverseAuction(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'transfer', 'cards'], async (ctx) => await transferUserCards(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'transfer', 'all'], async (ctx) => await transferUserAccount(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'embargo'], async (ctx) => await userEmbargo(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'wip'], async (ctx) => await wipMode(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'auction', 'lock'], async (ctx) => await modifyAuctionLock(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'announce', 'daily'], async (ctx) => await createAnnouncement(ctx), {perms: ['admin']})

registerBotCommand(['sudo', 'announce', 'important'], async (ctx) => await createAnnouncement(ctx, true), {perms: ['admin']})


const summon = async (ctx) => {}

const addCurrency = async (ctx, type = 'tomatoes') => {}

const addCards = async (ctx, multi = false) => {}

const removeCards = async (ctx, multi = false) => {}

const help = async (ctx) => {}

const manageRoles = async (ctx, remove = false) => {}

const modifyGuildOwner = async (ctx, remove = false) => {}

const usersInRole = async (ctx) => {}

const modifyGuildLocks = async (ctx, remove = false) => {}

const dailyReset = async (ctx) => {}

const reverseTransaction = async (ctx) => {}

const reverseAuction = async (ctx) => {}

const transferUserCards = async (ctx) => {}

const transferUserAccount = async (ctx) => {}

const userEmbargo = async (ctx) => {}

const wipMode = async (ctx) => {}

const modifyAuctionLock = async (ctx) => {}

const createAnnouncement = async (ctx, important = false) => {}

const refresh = async (ctx, global = true) => {
    const slashCommands = require("../static/commands.json")

    if (!global) {
        await ctx.bot.application.bulkEditGuildCommands('651599467174428703', slashCommands.admin)
    } else {
        await ctx.bot.application.bulkEditGlobalCommands(slashCommands.general)
    }

    return ctx.send(ctx, `updating ${global? 'global': 'admin'} commands!`)
}