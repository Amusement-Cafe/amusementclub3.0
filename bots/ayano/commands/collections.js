const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {Collections} = require("../../../db");


registerBotCommand('alias', async (ctx) => {
    if (!ctx.args.remove) {
        //Todo Filter out already added aliases
        const col = ctx.collections.filter(x => x.aliases.some(y => ctx.args.cols[0] === y))[0]

        if (!col) {
            return ctx.interaction.reply({content: `Nothing found`})
        }

        ctx.args.aliases.map(x => col.aliases.push(x))
        await col.save()
        ctx.collections = await Collections.find()

        return ctx.interaction.reply({content: `Added aliases \`${ctx.args.aliases.join(', ')}\` to collection ${col.name}`})
    } else {
        //Todo Remove aliases if given ones are found
        console.log('Removing')
    }

})