const {registerBotCommand} = require('../../../utils/commandRegistrar')

const _ = require('lodash')

registerBotCommand('summon', async (ctx) => await summonCard(ctx), {withCards: true})

registerBotCommand('info', async (ctx) => await cardInfo(ctx))


const summonCard = async (ctx) => {
    if (ctx.userCards.length === 0) {
        return ctx.send(ctx, `There are no cards found with your query to summon, or you have no cards to summon!`, 'red')
    }
    ctx.args.fmtOptions.amount = false
    const cardToDisplay = _.sample(ctx.userCards)
    return ctx.send(ctx, {
        embed: {
            description: `${ctx.boldName(ctx.user.username)} summons ${ctx.formatName(ctx, cardToDisplay)}!`,
            image: {
                url: cardToDisplay.cardURL
            }
        }
    })
}
const cardInfo = async (ctx) => {}