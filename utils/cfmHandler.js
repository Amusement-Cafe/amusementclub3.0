const {registerReaction} = require('./commandRegistrar')
const {cfmResolve} = require("./messageCreation");

registerReaction('cfm', async (ctx) => {
    await cfmResolve(ctx, true)
})
registerReaction('dcl', async (ctx) => {
    await cfmResolve(ctx, false)
})