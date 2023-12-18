const {
    confirmations,
    interactions,
    paginations,
    permissions
} = require('../utils/globalarrays')


const _ = require("lodash")

const send = async (ctx, user, args) => {
    let components = []

    if (typeof args === 'string') {
        args = {embed: {description: args}}
    }

    if (args.select) {
        args.select.map(x => components.push({type: 1, components: [x]}))
    }

    if (args.buttons) {
        let chunk = _.chunk(args.buttons, 5)
        chunk.map(x => components.push({type: 1, components: x}))
    }

    if (components.length > 5) {
        throw Error('Too Many Action Rows in message')
    }

    let response

    if (args.edit) {
        response = await ctx.interaction.editOriginal({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components})
    } else if (args.parent) {
        response = await ctx.interaction.editParent({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components})
    } else {
        response = await ctx.interaction.createFollowup({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components})
    }

    if (args.permissions) {
        permissions.push({permissions: args.permissions, msgid: response? response.id: ctx.interaction.message.id})
    }
}

const sendPagination = async (ctx, user, args) => {

}

const sendConfirmation = async (ctx, user, args) => {

}

const sendModal = async (ctx, user, args) => {

}

module.exports = {
    send,
    sendPagination,
    sendConfirmation,
    sendModal
}