const {registerBotCommand} = require('../../../utils/commandRegistrar')

const {
    fetchAllGuildUsers
} = require("../helpers/guildUser")
const {getCollectionByAlias} = require("../helpers/collections");

registerBotCommand(['guild', 'info'], async (ctx) => await guildInfo(ctx))

registerBotCommand(['guild', 'donate'], async (ctx) => await donateGuild(ctx))

registerBotCommand(['guild', 'set', 'tax'], async (ctx) => await setGuildTax(ctx))

registerBotCommand(['guild', 'set', 'report'], async (ctx) => await setGuildReport(ctx))

registerBotCommand(['guild', 'managers', 'add'], async (ctx) => await modifyGuildManagers(ctx))

registerBotCommand(['guild', 'managers', 'remove'], async (ctx) => await modifyGuildManagers(ctx, false))

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
    ctx.guild.tomatoes += ctx.args.amount
    await ctx.guild.save()

    return ctx.send(ctx, `You have successfully donated ${ctx.boldName(ctx.fmtNum(ctx.args.amount))}${ctx.symbols.tomato} to this guild. The guild now has ${ctx.boldName(ctx.fmtNum(ctx.guild.tomatoes))}${ctx.symbols.tomato}!`)
}

//Todo add checks for permissions for all below
const setGuildTax = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    const tax = ctx.args.tax || 0

    ctx.guild.tax = tax
    await ctx.guild.save()

    return ctx.send(ctx, `The claim tax for the current guild is now set to ${ctx.boldName(tax)}%`)
}

const setGuildReport = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    ctx.guild.reportChannel = ctx.interaction.channelID
    await ctx.guild.save()
    let testMsg
    try {
        testMsg = await ctx.interaction.channel.createMessage({
            content: "test"
        })
    } catch (e) {
        return ctx.send(ctx, `Amusement club needs permissions to send messages in this channel. Reports are generated as a normal message and not an interaction response!`, 'red')
    }

    await testMsg.delete('Deleting Test Message')

    return ctx.send(ctx, `Amusement club will now post all maintenance reports in this channel.`)
}

const modifyGuildManagers = async (ctx, add = true) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }
    return ctx.send(ctx, `Test`)
}

const setGuildLock = async (ctx, unlock = false) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }

    if (unlock) {
        let lastLock = ctx.guild.lockCol
        ctx.guild.lockCol = null
        await ctx.guild.save()
        return ctx.send(ctx, `Successfully unlocked the guild from ${lastLock}!`)
    }
    if (!ctx.args.cols[0]) {
        return ctx.send(ctx, `There was an error finding a collection for \`${ctx.args.colQuery}\`. Please try your search again!`, 'red')
    }
    let col = getCollectionByAlias(ctx, ctx.args.cols[0])
    ctx.guild.lockCol = col[0].collectionID
    await ctx.guild.save()
    console.log(ctx.args)
    console.log(ctx.args.cols)

    return ctx.send(ctx, `Successfully locked the guild to \`${ctx.args.cols[0]}\`!`)
}

const convertGuildLemons = async (ctx) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }

    ctx.guild.tomatoes += ctx.args.amount * 5
    await ctx.guild.save()

    return ctx.send(ctx, `You have successfully converted ${ctx.boldName(ctx.fmtNum(ctx.args.amount))} of the guild's ${ctx.symbols.lemon} into ${ctx.boldName(ctx.fmtNum(ctx.args.amount * 5))}${ctx.symbols.tomato}`)
}

const modifyGuildStructure = async (ctx, downgrade = false) => {
    if (!ctx.guild || ctx.isGuildDM(ctx)) {
        return ctx.send(ctx, `Something has gone wrong fetching the guild you are in, or you are attempting to use this command in DMs!\nPlease try another command or run this command within a server to get a proper result.`, 'red')
    }

    return ctx.send(ctx, `test`)
}