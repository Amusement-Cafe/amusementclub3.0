const {registerReaction} = require('./commandRegistrar')
const {cfmResolve, switchPage} = require("./messageCreation");

registerReaction('cfm', async (ctx) => {
    await cfmResolve(ctx, true)
})
registerReaction('dcl', async (ctx) => {
    await cfmResolve(ctx, false)
})

registerReaction(['pgn', 'next'], async (ctx) => {
    await switchPage(ctx, cur => cur + 1)
})