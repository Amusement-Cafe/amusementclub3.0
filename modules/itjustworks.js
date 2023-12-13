const _ = require('lodash')

const {
    permissions
} = require('./commandhandler')



const sendMessageThing = async (ctx, user, args) => {
    if (typeof args === 'string') {
        args = {embed: {description: args}}
    }
    let components = []
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
    console.log(args)
    const response = await ctx.interaction.createFollowup({content: args.content || '', embeds: args.embed? [args.embed]: [] , components: components})
    if (args.permissions) {
        permissions.push({permissions: args.permissions, msgid: response.id})
    }
    console.log(permissions)
}

module.exports = {
    sendMessageThing,
}