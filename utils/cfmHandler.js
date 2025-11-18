const {
    registerReaction,
} = require('./commandRegistrar')

const {
    cfmResolve,
    switchPage,
} = require("./messageCreation")

const {
    completeTransaction
} = require("../bots/amusement/helpers/transactions")

registerReaction('cfm', async (ctx) => {
    await cfmResolve(ctx, true)
})
registerReaction('dcl', async (ctx) => {
    await cfmResolve(ctx, false)
})

registerReaction(['trans', 'cfm'], async (ctx) => await completeTransaction(ctx))
registerReaction(['trans', 'dcl'], async (ctx) => await completeTransaction(ctx, true))

registerReaction(['pgn', 'next'], async (ctx) => await switchPage(ctx, cur => cur + 1))
registerReaction(['pgn', 'back'], async (ctx) =>  await switchPage(ctx, cur => cur - 1))
registerReaction(['pgn', 'first'], async (ctx) => await switchPage(ctx, cur => 0))
registerReaction(['pgn', 'last'], async (ctx) => await switchPage(ctx, cur => -1))
registerReaction(['pgn', 'pages'], async (ctx) => {
    return ctx.interaction.createModal({
        title: 'Enter Your Page Number',
        customID: 'pgn_custom',
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 4,
                        customID: 'pageNumber',
                        label: 'Page Number',
                        style: 1,
                        minLength: 1,
                        maxLength: 6,
                        placeholder: 'Enter the page number to navigate to',
                        required: true
                    }
                ]
            },
        ]
    })
})
registerReaction(['pgn', 'custom'], async (ctx) => await switchPage(ctx, cur => isNaN(Number(ctx.options.pageNumber))? 0: Number(ctx.options.pageNumber) - 1))