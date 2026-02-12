const {registerBotCommand} = require('../../../utils/commandRegistrar')

const {
    fetchAllGuildUsers
} = require("../helpers/guildUser")

registerBotCommand(['guild', 'info'], async (ctx) => await guildInfo(ctx))

registerBotCommand(['guild', 'donate'], async (ctx) => await donateGuild(ctx))

registerBotCommand(['guild', 'set', 'tax'], async (ctx) => await setGuildTax(ctx))

registerBotCommand(['guild', 'set', 'report'], async (ctx) => await setGuildReport(ctx))

registerBotCommand(['guild', 'managers', 'add'], async (ctx) => await modifyGuildManagers(ctx))

registerBotCommand(['guild', 'managers', 'remove'], async (ctx) => await modifyGuildManagers(ctx, true))

registerBotCommand(['guild', 'lock'], async (ctx) => await setGuildLock(ctx))

registerBotCommand(['guild', 'unlock'], async (ctx) => await setGuildLock(ctx, true))

registerBotCommand(['guild', 'convert'], async (ctx) => await convertGuildLemons(ctx))

registerBotCommand(['guild', 'structure', 'upgrade'], async (ctx) => await modifyGuildStructure(ctx))

registerBotCommand(['guild', 'structure', 'downgrade'], async (ctx) => await modifyGuildStructure(ctx, true))

const guildInfo = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    let guildUsers = await fetchAllGuildUsers(ctx)
    let response = []
    response.push(`Players: ${guildUsers.length}/${ctx.interaction.guild.memberCount}`)
    response.push(`Claim tax: ${ctx.boldName(ctx.guild.tax)}%`)
    response.push(`Guild Finances: ${ctx.boldName(ctx.fmtNum(ctx.guild.tomatoes))}${ctx.symbols.tomato} | ${ctx.boldName(ctx.fmtNum(ctx.guild.lemons))}${ctx.symbols.lemon}`)
    return ctx.send(ctx, {
        embed: {
            thumbnail: {url: ctx.interaction.guild.iconURL()},
            author: {name: `${ctx.interaction.guild.name}`},
            description: response.join('\n'),
            color: ctx.colors.blue
        }
    })
}

//Todo add tracker of guild donators in guild DB
const donateGuild = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser) {
        return ctx.send(ctx, `A guild user entry has not been found for you! Please try your command again, and if you continue receiving this message please report it.`, 'red')
    }
    let amount = Number(ctx.args.amount)
    if (amount <= 0) {
        return ctx.send(ctx, `You cannot take money from the guild or donate 0 tomatoes!`, 'red')
    }
    if (amount > ctx.user.tomatoes) {
        return ctx.send(ctx, `You cannot donate more tomatoes than you own!`, 'red')
    }
    if (isNaN(amount)) {
        return ctx.send(ctx, `There was an error converting your input into a number, please try again!`, 'red')
    }
    ctx.guild.tomatoes += amount
    await ctx.guild.save()

    ctx.user.tomatoes -= amount
    await ctx.user.save()
    ctx.guildUser.donations += amount
    await ctx.guildUser.save()
    await ctx.updateStat(ctx, 'tomatoOut', amount)

    return ctx.send(ctx, `You have successfully donated ${ctx.boldName(ctx.fmtNum(ctx.args.amount))}${ctx.symbols.tomato} to this guild. The guild now has ${ctx.boldName(ctx.fmtNum(ctx.guild.tomatoes))}${ctx.symbols.tomato}!`)
}

//Todo add checks for permissions for all below
const setGuildTax = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can set guild tax percentages! The guild owner or other managers can add managers with the \`/guild managers add\` command.`, 'red')
    }
    const tax = Number(ctx.args.tax) || 0

    ctx.guild.tax = tax
    await ctx.guild.save()

    return ctx.send(ctx, `The claim tax for the current guild is now set to ${ctx.boldName(tax)}%`)
}

const setGuildReport = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can set the guild report channel! The guild owner or other managers can add managers with the \`/guild managers add\` command.`, 'red')
    }

    let testMsg
    try {
        testMsg = await ctx.interaction.channel.createMessage({
            content: "test"
        })
    } catch (e) {
        return ctx.send(ctx, `Amusement club needs permissions to send messages in this channel. Reports are generated as a normal message and not an interaction response!`, 'red')
    }
    ctx.guild.reportChannel = ctx.interaction.channelID
    await ctx.guild.save()
    await testMsg.delete('Deleting Test Message')

    return ctx.send(ctx, `Amusement club will now post all maintenance reports in this channel.`)
}

const modifyGuildManagers = async (ctx, remove = true) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can modify guild managers!`, 'red')
    }
    return ctx.send(ctx, `Test`)
}

const setGuildLock = async (ctx, unlock = false) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can set guild lock! The guild owner or other managers can add managers with the \`/guild managers add\` command.`, 'red')
    }
    let lockCost = 1000000000

    if (ctx.guild.tomatoes < lockCost) {
        return ctx.send(ctx, `The guild doesn't have enough tomatoes to lock to a collection! Guild lock takes ${ctx.boldName(ctx.fmtNum(lockCost))}${ctx.symbols.tomato}, the guild only has ${ctx.boldName(ctx.fmtNum(ctx.guild.tomatoes))}${ctx.symbols.tomato}`, 'red')
    }
    if (unlock) {
        let lastLock = ctx.guild.lockCol
        ctx.guild.lockCol = ''
        await ctx.guild.save()
        return ctx.send(ctx, `Successfully unlocked the guild from ${lastLock}!`)
    }
    if (!ctx.args.cols[0]) {
        return ctx.send(ctx, `There was an error finding a collection for \`${ctx.args.colQuery}\`. Please try your search again!`, 'red')
    }

    let col = ctx.collections.find(x => ctx.args.cols[0] === x.collectionID)

    if ((col.promo || !col.inClaimPool || col.rarity) && !ctx.user.roles.some(x=> x === 'admin')) {
        return ctx.send(ctx, `You cannot lock guilds to limited collections!`, 'red')
    }

    ctx.guild.lockCol = col.collectionID
    await ctx.guild.save()

    return ctx.send(ctx, `Successfully locked the guild to \`${col.name}\`!`)
}

const convertGuildLemons = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can convert guild lemons! The guild owner or other managers can add managers with the \`/guild managers add\` command.`, 'red')
    }
    let amount = Number(ctx.args.amount)
    if (isNaN(amount)) {
        return ctx.send(ctx, `There was an error converting your input into a number, please try again!`, 'red')
    }
    if (amount <= 0) {
        return ctx.send(ctx, `You cannot convert an amount of lemons equal to or less than 0!`, 'red')
    }
    if (amount > ctx.guild.lemons) {
        return ctx.send(ctx, `The guild doesn't have enough lemons to fund this conversion!`, 'red')
    }
    ctx.guild.tomatoes += amount * 5
    ctx.guild.lemons -= amount
    await ctx.guild.save()

    return ctx.send(ctx, `You have successfully converted ${ctx.boldName(ctx.fmtNum(amount))} of the guild's ${ctx.symbols.lemon} into ${ctx.boldName(ctx.fmtNum(amount * 5))}${ctx.symbols.tomato}`)
}

const modifyGuildStructure = async (ctx, downgrade = false) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    if (!ctx.guildUser || !ctx.guildUser.roles.some(x => x === 'manager')) {
        return ctx.send(ctx, `Only guild managers can modify structures! The guild owner or other managers can add managers with the \`/guild managers add\` command.`, 'red')
    }
    return ctx.send(ctx, `test`)
}