const {
    interactions,
} = require('../utils/globalarrays')

const {
    rct
} = require('../utils/cmd')


const _ = require("lodash")

/**
 *
 * @param ctx
 * @param user
 * @param args
 * @returns {Promise<void>}
 */
const send = async (ctx, user, args) => {
    let components = args.components || []

    if (typeof args === 'string') {
        args = {embed: {description: args}}
    }

    if (!args.components) {
        if (args.selection) {
            args.selection.map(x => components.push({type: 1, components: [x]}))
        }

        if (args.buttons) {
            let chunk = _.chunk(args.buttons, 5)
            chunk.map(x => components.push({type: 1, components: x}))
        }
    }

    if (components.length > 5) {
        throw Error('Too Many Action Rows in message')
    }

    let response

    if (args.edit) {
        response = await ctx.interaction.editOriginal({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components, files: args.files || []})
    } else if (args.parent) {
        response = await ctx.interaction.editParent({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components, files: args.files || []})
    } else {
        response = await ctx.interaction.createFollowup({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components, files: args.files || []})
    }


    args.msgID = response? response.message? response.message.id: response.id: ctx.interaction.message.id
    args.channelID = response? response.message? response.message.channelID: ctx.interaction.channelID: ctx.interaction.message.channelID


    if ((args.buttons || args.selection) && args.permissions)
        interactions.push(args)

    return response
}

const switchPage = async (ctx, newPage) => {
    const userID = ctx.interaction.member? ctx.interaction.member.id: ctx.interaction.user.id
    const pgn = interactions.filter(x => x.msgID === ctx.interaction.message.id && x.permissions.pages.includes(userID))[0]
    if (!pgn) return

    const max = pgn.pages.length - 1

    pgn.pageNum = newPage(pgn.pageNum)

    if(pgn.pageNum === Infinity || (pgn.pageNum < 0)) pgn.pageNum = max
    else if(pgn.pageNum > max) pgn.pageNum = 0


    pgn.switchPage(pgn)

    if(pgn.embed.footer.text.startsWith('Page'))
        pgn.embed.footer.text = `Page ${pgn.pageNum + 1}/${pgn.pages.length}`
    await ctx.interaction.editParent({ embeds: [pgn.embed] })
}

const cfmResolve = async (ctx, confirm) => {
    let data
    const userID = ctx.interaction.member? ctx.interaction.member.id: ctx.interaction.user.id
    if(confirm)
        data = interactions.filter(x => x.msgID === ctx.interaction.message.id && x.permissions.cfm.includes(userID))[0]

    if(!confirm)
        data = interactions.filter(x => x.msgID === ctx.interaction.message.id && x.permissions.dcl.includes(userID))[0]

    if(!data) return


    if(!confirm)
        await data.onDecline(ctx.interaction)

    if(data.checks && await data.checks())
        return await data.onError(ctx.interaction)

    if(confirm)
        await data.onConfirm(ctx.interaction)

    if(!data.persist)
        _.pull(interactions, data)
}

/**
 *
 * @param ctx - Base context object
 * @param user - Bot user object
 * @param args - The basic response args (e.g. buttons/pages/perms/onConfirm/onDecline/etc)
 * @returns {Promise<void>}
 */
const sendInteraction = async (ctx, user, args) => {
    let interaction = Object.assign({}, {
        userID: user.userID,
        permissions: {pages: [user.userID], cfm: [user.userID], dcl: [user.userID]},
        components: [],
        buttons: ['first', 'back', 'next', 'last'],
        pageNum: 0,
        interaction: ctx.interaction,
        embed: { title: 'Default Interaction Response Title' },
        onConfirm: () => ctx.interaction.editOriginal({embeds: [{description: 'Operation was confirmed!', color: ctx.colors.green}], components: []}),
        onDecline: () => ctx.interaction.editOriginal({embeds: [{description: 'Operation was declined!', color: ctx.colors.red}], components: []}),
        onTimeout: () => ctx.interaction.editOriginal({embeds: [{description: 'This confirmation dialog has expired!', color: ctx.colors.grey}], components: []}),
        onError: () => { },
        switchPage: data => data.embed.description = data.pages[data.pageNum],
        expires: new Date()
    }, args)

    interaction.embed.color = interaction.embed.color || ctx.colors.blue

    if (interaction.selection) {
        interaction.selection.map(x => interaction.components.push({type: 1, components: [x]}))
    }

    if (interaction.pages)
        interaction.switchPage(interaction)

    if (interaction.pages?.length > 1) {
        interaction.embed.footer = interaction.embed.footer || { text: `Page 1/${interaction.pages.length}`}
        let pgnButtons = interaction.customPgnButtons? interaction.customPgnButtons: []
        if (interaction.buttons?.includes('first') && !interaction.customPgnButtons) pgnButtons.push({type: 2, label: 'First', style: 1, customID: 'pgn_first'})
        if (interaction.buttons?.includes('back')  && !interaction.customPgnButtons) pgnButtons.push({type: 2, label: 'Back', style: 1, customID: 'pgn_back'})
        if (interaction.buttons?.includes('next')  && !interaction.customPgnButtons) pgnButtons.push({type: 2, label: 'Next', style: 1, customID: 'pgn_next'})
        if (interaction.buttons?.includes('last')  && !interaction.customPgnButtons) pgnButtons.push({type: 2, label: 'Last', style: 1, customID: 'pgn_last'})
        if (interaction.buttons?.includes('close') && !interaction.customPgnButtons) pgnButtons.push({type: 2, label: 'End', style: 4, customID: 'pgn_end'})
        interaction.components.push({ type: 1, components: pgnButtons })
    }

    if (interaction.confirmation) {
        let buttons = interaction.customCfmButtons || [
            { type: 2, label: 'Confirm', style: 3, customID: 'cfm_cfm'},
            { type: 2, label: 'Decline', style: 4, customID: 'cfm_dcl'}
        ]
        interaction.components.push({ type: 1, components: buttons })
    }

    if (interaction.customButtons)
        interaction.components.push({ type: 1, components: interaction.customButtons})

    if(interaction.checks && await interaction.checks())
        return await interaction.onError(ctx.interaction)

    if (interaction.pages?.length > 1 || interaction.confirmation || interaction.selection || interaction.customButtons)
        await invalidateOld(ctx, user)

    return send(ctx, user, interaction)
}

const invalidateOld = async (ctx, user) => {
    const oldInteraction = interactions.filter(x => x.userID === user.userID)[0]
    if (oldInteraction && oldInteraction.msgID && oldInteraction.channelID) {
        await ctx.bot.rest.interactions.editOriginalMessage(ctx.bot.application.id, oldInteraction.interaction.token, {embeds: [oldInteraction.embed], components: [] }).catch(e => e)
        _.pull(interactions, oldInteraction)
    }
}

rct('pgn', async (ctx) => {
    const type = ctx.id.pop()
    if (type === 'first') await switchPage(ctx, cur => 0)
    if (type === 'last') await switchPage(ctx, cur => Infinity)
    if (type === 'next') await switchPage(ctx, cur => cur + 1)
    if (type === 'back') await switchPage(ctx, cur => cur - 1)
    // if (type === 'end')
})

rct('cfm', async (ctx, user, args) => {
    ctx.id.pop() === 'cfm'? await cfmResolve(ctx, true): await cfmResolve(ctx, false)
})


module.exports = {
    send,
    sendInteraction,
}