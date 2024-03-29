const {
    parseArgs
} = require("../modules/interactions")

const tree = {
    cmd: {},
    rct: {},
    con: {},
    mod: {},
    itm: {},
}

const cmd = (...args) => buildTree(args)

const pcmd = (perm, ...args) => buildTree(args, perm)

const rct = (...args) => buildTree(args, false, 'rct')

const con = (...args) => buildTree(args, false, 'con')

const mod = (...args) => buildTree(args, false, 'mod')

const itm = (...args) => buildTree(args, false, 'itm')

const buildTree = (args, perm = false, type = 'cmd') => {
    let options
    if (args[args.length - 1].constructor.name !== 'AsyncFunction' ) {
        options = args.pop()
    }

    const callback = args.pop()
    const cursors = []

    args.map(alias => {
        let sequence = Array.isArray(alias) ? alias : [alias]
        let cursor = tree[type]

        sequence.map(arg => {
            if (!cursor.hasOwnProperty(arg)) {
                cursor[arg] = {}
            }

            cursor = cursor[arg]
        })

        cursor._callback = callback

        if(perm)
            cursor._perm = perm

        if(options)
            cursor._options = options

        cursors.push(cursor)
    })

    const chain = {
        access: (arg) => {
            cursors.map(x => {
                x._access = arg
            })
            return chain
        }
    }

    return chain
}

const trigger = async (type, ctx, user, args) => {
    let cursor = tree[type]
    let deferless, ephemeral, parsedArgs

    while (cursor.hasOwnProperty(args[0])) {
        cursor = cursor[args[0]]
        args.shift()
        if (type === 'cmd')
            ctx.capitalMsg.shift()
    }

    if (cursor._options) {
        if (cursor._options.deferless) {
            deferless = true
        }

        if (cursor._options.ephemeral) {
            await ctx.interaction.defer(64)
            ephemeral = true
        }

        if (cursor._options.forceDefer) {
            await ctx.interaction.defer()
        }
    }

    if (type === 'cmd' || type === 'mod') {
        if (!cursor.hasOwnProperty('_callback')) {
            await ctx.interaction.defer()
            return ctx.reply(user, `unknown command. Please check your spelling or use help`, 'red')
        }

        if (cursor._perm) {
            if(!user.roles || !cursor._perm.find(x => user.roles.some(y => x === y))) {
                await ctx.interaction.defer()
                return ctx.reply(user,`only users with roles **[${cursor._perm}]** can execute this command`, 'red')
            }
        }

        // if(!ctx.guild && cursor._access != 'dm') {
        //     await ctx.interaction.defer()
        //     return ctx.reply(user, `this command is possible only in guild (server) channel`, 'red')
        // }

        if (!deferless && !ephemeral) {
            await ctx.interaction.defer()
        }

        parsedArgs = parseArgs(ctx, user, ctx.options)
    }
    
    if (!cursor.hasOwnProperty('_callback'))
        return


    const newArgs = [ctx, user, parsedArgs || { }].concat(args)

    try {
        return await cursor._callback.apply({}, newArgs)
    } catch (err) {
        console.error(err) /* log actual error to the console */
        throw (err)
    }
}

module.exports = {
    cmd,
    pcmd,
    rct,
    con,
    mod,
    itm,
    trigger,
}

