const _ = require('lodash')

const {
    Auctions,
    Transactions,
    Users,
} = require('../collections')

const {
    formatCard,
    withCards,
} = require("../modules/card")

const {
    fetchGuildByID,
} = require("../modules/guild")

const {
    fetchUser
} = require("../modules/user")

const {
    addUserCards,
    getSpecificUserCards,
    removeUserCards,
} = require("../modules/usercards")

const {
    subTime,
} = require('../utils/tools')

const {
    pcmd,
} = require('../utils/cmd')


pcmd(['admin', 'mod'], ['sudo', 'summon'], async (ctx, user, args) => await sudoSum(ctx, user, args))

// pcmd(['admin', 'mod'], ['sudo', 'eval', 'reset'], async (ctx, user, args) => await sudoEvalReset(ctx, user, args))
//
// pcmd(['admin', 'mod'], ['sudo', 'eval', 'info'], async (ctx, user, args) => await sudoEvalInfo(ctx, user, args))
//
// pcmd(['admin', 'mod'], ['sudo', 'eval', 'force'], async (ctx, user, args) => await sudoEvalForce(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'tomatoes'], async (ctx, user, args) => await sudoAddCurrency(ctx, user, args, 'tomatoes'))

pcmd(['admin', 'mod'], ['sudo', 'add', 'vials'], async (ctx, user, args) => await sudoAddCurrency(ctx, user, args, 'vials'))

pcmd(['admin', 'mod'], ['sudo', 'add', 'lemons'], async (ctx, user, args) => await sudoAddCurrency(ctx, user, args, 'lemons'))

pcmd(['admin', 'mod'], ['sudo', 'add', 'promobal'], async (ctx, user, args) => await sudoAddCurrency(ctx, user, args, 'promoBal'))

pcmd(['admin', 'mod'], ['sudo', 'add', 'card'], async (ctx, user, args) => await sudoAddCard(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'add', 'cards'], async (ctx, user, args) => await sudoAddCards(ctx, user, args))

pcmd(['admin', 'mod'], ['sudo', 'remove', 'card'], async (ctx, user, args) => await sudoRemoveCard(ctx, user, args))

// pcmd(['admin'], ['sudo', 'help'], async (ctx, user, args) => await sudoHelp(ctx, user, args))

pcmd(['admin'], ['sudo', 'add', 'role'], async (ctx, user, args) => await sudoAddRole(ctx, user, args))

pcmd(['admin'], ['sudo', 'add', 'owner'], async (ctx, user, args) => await sudoAddGuildOwner(ctx, user, args))

pcmd(['admin'], ['sudo', 'remove', 'role'], async (ctx, user, args) => await sudoRemoveRole(ctx, user, args))

pcmd(['admin'], ['sudo', 'remove', 'owner'], async (ctx, user, args) => await sudoRemoveGuildOwner(ctx, user, args))

pcmd(['admin'], ['sudo', 'inrole'], async (ctx, user, args) => await sudoInRole(ctx, user, args))

pcmd(['admin'], ['sudo', 'guild', 'lock'], async (ctx, user, args) => await sudoGuildLock(ctx, user, args))

pcmd(['admin'], ['sudo', 'guild', 'unlock'], async (ctx, user, args) => await sudoGuildUnlock(ctx, user, args))

pcmd(['admin'], ['sudo', 'reset', 'daily'], async (ctx, user, args) => await sudoDailyReset(ctx, user, args))

// pcmd(['admin'], ['sudo', 'hero', 'score'], async (ctx, user, args) => await sudoHeroScore(ctx, user, args))
//
// pcmd(['admin'], ['sudo', 'guild', 'herocheck'], async (ctx, user, args) => await sudoGuildHeroCheck(ctx, user, args))

pcmd(['admin'], ['sudo', 'reverse', 'transaction'], async (ctx, user, args) => await sudoReverseTransaction(ctx, user, args))

pcmd(['admin'], ['sudo', 'reverse', 'auction'], async (ctx, user, args) => await sudoReverseAuction(ctx, user, args))

pcmd(['admin'], ['sudo', 'refresh', 'global'], async (ctx, user, args) => await sudoRefreshGlobalCommands(ctx, user, args))

pcmd(['admin'], ['sudo', 'refresh', 'admin'], async (ctx, user, args) => await sudoRefreshAdminCommands(ctx, user, args))

pcmd(['admin'], ['sudo', 'transfer'], async (ctx, user, args) => await sudoTransferCards(ctx, user, args))

pcmd(['admin'], ['sudo', 'embargo'], async (ctx, user, args) => await sudoEmbargoUser(ctx, user, args))

pcmd(['admin'], ['sudo', 'wip'], async (ctx, user, args) => await sudoMaintenanceMode(ctx, user, args))

pcmd(['admin'], ['sudo', 'auclock'], async (ctx, user, args) => await sudoAuctionLock(ctx, user, args))

pcmd(['admin'], ['sudo', 'announce'], async (ctx, user, args) => await sudoAnnouncement(ctx, user, args), {deferless: true})

const sudoSum = withCards(async (ctx, user, args, cards) => {
    const card = _.sample(cards)

    if (card.imgur) {
        await ctx.reply(user, `summons **${formatCard(ctx, card)}**`)
        return ctx.bot.rest.channels.createMessage(ctx.interaction.channelID, {content: card.imgur})
    }

    return ctx.sendInteraction(ctx, user, {
        embed: {
            image: {url: card.url},
            color: ctx.colors.blue,
            description: `**${user.username}** summons **${formatCard(ctx, card)}**!`
        }
    })
}, {global: true})

/*
 ToDo
 Once Proper Evals are implemented, circle back to these

const sudoEvalReset = withCards(async (ctx, user, args) => {

}, {global: true})

const sudoEvalInfo = withCards(async (ctx, user, args) => {

}, {global: true})

const sudoEvalForce = withCards(async (ctx, user, args) => {

}, {global: true})
*/

const sudoAddCurrency = async (ctx, user, args, currency) => {
    const reply = []

    await Promise.all(args.users.split(' ').map(async x => {
        const target = await fetchUser(x)

        if (!target)
            return reply.push(`Bot User with ID \`${x}\` was not found!`)

        target[currency] += args.amount
        await target.save()
        reply.push(`\`✅\` added **${args.amount}** ${ctx.symbols[currency]} to **${target.username}** \`${target.userID}\``)
    }))

    return ctx.reply(user, reply.join('\n'))
}

const sudoAddCard = withCards(async (ctx, user, args, cards) => {
    const target = await fetchUser(args.userIDs[0])
    if (!target)
        return ctx.reply(user, `bot user with ID \`${args.userIDs[0]}\` was not found!`, 'red')
    const card = cards[0]
    if (!card)
        return ctx.reply(user, `a card matching your query was not found!`, 'red')

    await addUserCards(target, [card.id])

    return ctx.reply(user, `added ${formatCard(ctx, card)} to user **${target.username}!`)
}, {global: true})

const sudoAddCards = withCards(async (ctx, user, args, cards) => {
    const target = await fetchUser(args.userIDs[0])
    if (!target)
        return ctx.reply(user, `bot user with ID \`${args.userIDs[0]}\` was not found!`, 'red')
    if (cards.length === 0)
        return ctx.reply(user, `a card matching your query was not found!`, 'red')

    await addUserCards(target, cards.map(x => x.id))

    return ctx.reply(user, `added **${cards.length}** cards to user **${target.username}!`)
}, {global: true})

const sudoRemoveCard = withCards(async (ctx, user, args, cards) => {
    const target = await fetchUser(args.userIDs[0])
    if (!target)
        return ctx.reply(user, `bot user with ID \`${args.userIDs[0]}\` was not found!`, 'red')
    const card = cards[0]
    if (!card)
        return ctx.reply(user, `a card matching your query was not found!`, 'red')

    await removeUserCards(target, [card.id])

    return ctx.reply(user, `removed ${formatCard(ctx, card)} from user **${target.username}!`)
}, {global: true})

/*
ToDo
Requires new help setup
const sudoHelp = async (ctx, user, args) => {}
*/

const sudoAddRole = async (ctx, user, args) => {
    const reply = []

    await Promise.all(args.userIDs.split(' ').map(async x => {
        const target = await fetchUser(x)

        if (!target)
            return reply.push(`Bot User with ID ${x} not found`)

        args.roles.split(' ').map(y => {
            if (target.roles.some(z => z === y)) {
                reply.push(`\`❌\` **${target.username}** \`${target.userID}\` already has the role ${y}`)
            } else {
              target.roles.push(y)
              reply.push(`\`✅\` added '${y}' to **${target.username}** \`${target.userID}\``)
            }
        })

        await target.save()
    }))

    return ctx.reply(user, reply.join('\n'))
}

const sudoAddGuildOwner = async (ctx, user, args) => {
    const guild = await fetchGuildByID(args.guildID)

    if (!guild)
        return ctx.reply(user, `no bot guild found with ID \`${args.guildID}\`!`, 'red')

    const target = await fetchUser(args.ids[0])

    if (!target)
        return ctx.reply(user, `a bot user with ID \`${args.ids[0]}\` could not be found!`, 'red')

    guild.ownerID = target.userID
    await guild.save()

    return ctx.reply(user, `set **${target.username}** as the new owner for guild with ID \`${args.guildID}\``)
}

const sudoRemoveRole = async (ctx, user, args) => {
    const reply = []

    await Promise.all(args.userIDs.split(' ').map(async x => {
        const target = await fetchUser(x)

        if (!target)
            return reply.push(`Bot User with ID ${x} not found`)

        args.roles.split(' ').map(y => {
            if (!target.roles.some(z => z === y)) {
                reply.push(`\`❌\` **${target.username}** \`${target.userID}\` does not have the role ${y}`)
            } else {
                target.roles = target.roles.filter(z => z != y)
                reply.push(`\`✅\` removed role '${y}' from **${target.username}** \`${target.userID}\``)
            }
        })

        await target.save()
    }))

    return ctx.reply(user, reply.join('\n'))
}

const sudoRemoveGuildOwner = async (ctx, user, args) => {
    const guild = await fetchGuildByID(args.guildID)

    if (!guild)
        return ctx.reply(user, `no bot guild found with ID \`${args.guildID}\`!`, 'red')

    guild.ownerID = null
    await guild.save()

    return ctx.reply(user, `removed owner for guild with ID \`${args.guildID}\``)
}

const sudoInRole = async (ctx, user, args) => {
    const inRole = await Users.find({roles: {$ne: [], $in: args.roles.split(' ')}}).sort('username')
    if (inRole.length === 0)
        return ctx.reply(user, `no users found in role(s) **${args.roles}**`, 'red')

    return ctx.sendInteraction(ctx, user, {
        pages: ctx.makePages(inRole.map(x => `${x.username} \`${x.userID}\` - ${x.roles.join(', ')}`), 20),
        embed: {
            author: { name: `All users with role(s) ${args.roles}`}
        }
    })
}

const sudoGuildLock = async (ctx, user, args) => {
    if (args.cols.length === 0)
        return ctx.reply(user, `collection with ID \`${args.colQuery}\` was not found!`, 'red')
    const guild = await fetchGuildByID(args.guildID)

    if (!guild)
        return ctx.reply(user, `no bot guild found with ID \`${args.guildID}\`!`, 'red')

    const col = _.flattenDeep(args.cols)[0]

    guild.lock.active = true
    guild.lock.adminSet = true
    guild.lock.collection = col.id
    await guild.save()

    return ctx.reply(user, `guild \`${args.guildID}\` has been admin locked to **${col.name}**!`)
}

const sudoGuildUnlock = async (ctx, user, args) => {
    const guild = await fetchGuildByID(args.guildID)

    if (!guild)
        return ctx.reply(user, `no bot guild found with ID \`${args.guildID}\`!`, 'red')

    guild.lock.active = false
    guild.lock.adminSet = false
    guild.lock.collection = ''
    await guild.save()

    return ctx.reply(user, `admin lock for guild \`${args.guildID}\` has been removed!`, 'red')
}

// ToDo Make this not break stats or quests
const sudoDailyReset = async (ctx, user, args) => {
    if (args.userIDs.length === 0)
        return ctx.reply(user, `at least one user ID is required for this command!`, 'red')

    const reply = []
    const past = subTime(new Date(), 1, 'day')

    await Promise.all(args.userIDs.map(async x => {
        const target = await fetchUser(x)
        if (!target)
            return reply.push(`\`${x}\` is an invalid User ID or they are not a bot user!`)
        target.lastDaily = past
        await target.save()

        reply.push(`\`✅\` daily reset for **${target.username}** (${target.userID})`)
    }))

    return ctx.reply(user, reply.join('\n'))
}

/*ToDo Potentially Re-implement when heroes are brought back
const sudoHeroScore = async (ctx, user, args) => {}

const sudoGuildHeroCheck = async (ctx, user, args) => {}
*/

const sudoReverseTransaction = async (ctx, user, args) => {
    const transaction = await Transactions.findOne({ transactionID: args.transactionID })
    if (!transaction)
        return ctx.reply(user, `a transaction with ID \`${args.transactionID}\` could not be found in reversible transactions!`, 'red')
    if (transaction.status === 'pending')
        return ctx.reply(user, `this transaction is currently pending and should be declined by the user!`, 'red')

    const fromUser = await fetchUser(transaction.fromUserID)
    const toUser = await fetchUser(transaction.toUserID)

    if (toUser) {
        const toUserCards = await getSpecificUserCards(user, transaction.cards)
        if (!toUserCards)
            return ctx.reply(user, `some or all of the cards that were sold in this transaction have already been removed or sold by the buyer, reverse has been cancelled!`, 'red')
        return ctx.sendInteraction(ctx, user, {
            question: ``,
            onConfirm: async () => {}
        })
    }

    return ctx.sendInteraction(ctx, user, {

    })
}

const sudoReverseAuction = async (ctx, user, args) => {
    const auction = await Auctions.findOne({ auctionID: args.auctionID })
    if (!auction)
        return ctx.reply(user, `an auction with ID \`${args.auctionID}\` could not be found in reversible auctions!`, 'red')
    if (auction.cancelled || !auction.finished)
        return ctx.reply(user, `this auction was cancelled or is still active and cannot be reversed!`, 'red')
    if (auction.bids.length == 0)
        return ctx.reply(user, `there were no bids on this auction, nothing to reverse!`, 'red')

    return ctx.sendInteraction(ctx, user, {
        question: ``,
        onConfirm: async () => {}
    })

}

const sudoRefreshGlobalCommands = async (ctx, user, args) => {
    await ctx.bot.application.bulkEditGlobalCommands(ctx.slashCmd)
    return ctx.reply(user, `an update the **GLOBAL** commands is now in progress. Please allow up to an hour for your client to display these updates!`)
}

const sudoRefreshAdminCommands = async (ctx, user, args) => {
    await ctx.bot.application.bulkEditGuildCommands(ctx.adminGuildID, ctx.adminCmd)
    return ctx.reply(user, `an update of the **ADMIN** commands is now in progress. Please allow a few minutes for your client to display these updates!`)
}

const sudoTransferCards = async (ctx, user, args) => {}


const sudoEmbargoUser = async (ctx, user, args) => {
    const lift = args.lift
    const reply = []
    if (args.userIDs.length === 0)
        return ctx.reply(user, `at least one user ID is required for this command!`, 'red')

    await Promise.all(args.userIDs.map(async x => {
        const target = await fetchUser(x)
        if (!target)
            return reply.push(`\`${x}\` is an invalid User ID or they are not a bot user!`)

        if (lift) {
            target.ban.embargo = false
            reply.push(`**${user.username} has been lifted`)
            await target.save()
            try {
                await ctx.direct(ctx, target, "Your embargo has been lifted, you may now return to normal bot usage. Please try to follow the rules, they can easily be found at `/rules`")
            } catch (e) {
                reply.push(`${target.username} doesn't allow PMs from the bot, so a message was not sent`)
            }
        } else {
            target.ban.embargo = true
            reply.push(`**${target.username}** has been embargoed`)
            await target.save()
        }
    }))

    return ctx.reply(user, reply.join('\n'))
}

const sudoMaintenanceMode = async (ctx, user, args) => {
    ctx.settings.wip = !ctx.settings.wip
    ctx.settings.wipMsg = args.message? args.message: `the bot is currently undergoing maintenance. Please check again later |ω･)ﾉ`

    await ctx.bot.editStatus(ctx.settings.wip? "idle": "online", ctx.settings.wip? [{ name: 'maintenance', type: 2}]: [{ name: 'commands', type: 2}])

    return ctx.reply(user, `maintenance mode is now **${ctx.settings.wip? 'ENABLED': 'DISABLED'}**!`, ctx.settings.wip? 'green': 'red')
}

const sudoAuctionLock = async (ctx, user, args) => {
    ctx.settings.aucLock = !ctx.settings.aucLock

    return ctx.reply(user, `auction lock has been **${ctx.settings.aucLock? `ENABLED` : `DISABLED`}**`, ctx.settings.aucLock? `green`: `red`)
}

const sudoAnnouncement = async (ctx, user, args) => {
    return ctx.interaction.createModal({
        title: "Bot Announcement Form",
        customID: "sudoAnnounce",
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'announceTitle',
                        label: 'Announcement Title',
                        style: 1,
                        minLength: 1,
                        maxLength: 512,
                        placeholder: 'Announcement Title Goes Here',
                        required: true
                    }
                ]
            },
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'announceBody',
                        label: 'Announcement Body',
                        style: 2,
                        minLength: 1,
                        maxLength: 4000,
                        placeholder: 'Announcement Body Goes Here',
                        required: true
                    }
                ]
            }
        ]
    })
}