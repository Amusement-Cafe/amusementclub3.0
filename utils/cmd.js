const tree = {
    cmd: {},
    rct: {},
    con: {},
    mod: {},
    itm: {},
}

const cmd = (...args) => buildTree(args)

const pcmd = (perm, ...args) => buildTree(args, perm)

const rct = (...args) => {
    const callback = args.pop()
    const cursor = tree.rct

    mapArgs(cursor, args, callback)
}

const con = (...args) => {
    const callback = args.pop()
    const cursor = tree.con

    mapArgs(cursor, args, callback)
}

const mod = (...args) => {
    const callback = args.pop()
    const cursor = tree.mod

    mapArgs(cursor, args, callback)
}

const itm = (...args) => {
    const callback = args.pop()
    const cursor = tree.itm

    mapArgs(cursor, args, callback)
}

const mapArgs = (cursor, args, callback) => {
    args.map(alias => {
        if (!cursor.hasOwnProperty(alias)) {
            cursor[alias] = {}
        }

        cursor[alias]._callback = callback
    })
}

const buildTree = (args, perm) => {
    let options
    if (args[args.length - 1].constructor.name !== 'AsyncFunction' ) {
        options = args.pop()
    }

    const callback = args.pop()
    const cursors = []

    args.map(alias => {
        let sequence = Array.isArray(alias) ? alias : [alias]
        let cursor = tree.cmd

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
    let deferless, ephemeral

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
    }

    if (type === 'cmd') {
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
    }
    
    if (!cursor.hasOwnProperty('_callback'))
        return


    const newArgs = [ctx, user || { }].concat(args)

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

