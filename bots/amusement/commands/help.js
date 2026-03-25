const {
    registerBotCommand,
    registerReaction
} = require('../../../utils/commandRegistrar')

const {
    Button,
    Selection
} = require("../helpers/componentBuilders")

const {
    main,
    subMenus,
} = require('../static/embeds/help')

const helpSelect = require('../static/menus/help/help.json')

const startPage = new Button('helpStart').setLabel('Main Menu').setStyle(2)

registerBotCommand('help', async (ctx) => await helpStart(ctx))
registerReaction('help', async (ctx) => await displayHelpPage(ctx))
registerReaction('helpStart', async (ctx) => await helpStart(ctx, true))


const helpStart = async (ctx, back = false) => {
    const senko = 'No help for you\n```⠀⠀⠀⠀⠀⠀⠀⠀⣾⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⢧⠀⠀⠀⠀⠀⠀⠀\n' +
        '⠀⠀⠀⠀⠀⠀⠀⢰⣿⠈⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⢸⠀⠀⠀⠀⠀⠀⠀\n' +
        '⠀⠀⠀⠀⠀⠀⢠⣿⡿⠀⢸⢀⡀⠀⠀⠀⠀⠀⠀⣰⣿⠃⢸⠀⠀⠀⠀⠀⠀⠀\n' +
        '⠀⠀⠀⠀⠀⠀⣾⣿⠟⠛⠞⢹⣁⣀⣀⣀⣀⣤⣾⣿⡿⠴⢾⢤⠄⠀⠀⠀⠀⠀\n' +
        '⠀⠀⠀⠀⠀⣼⣿⣿⣀⣀⣜⣯⠁⠀⠈⠉⠉⠉⠛⠻⠦⣄⠀⣚⠦⠀⠀⠀⠀⠀\n' +
        '⠀⠀⠀⢀⣼⠿⠿⠏⠈⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⠤⣀⣀⡀⠀⠀\n' +
        '⠀⠀⢀⡜⠁⠀⠀⣠⡄⠀⠀⠀⠀⢀⡀⠀⠀⠀⠀⠀⣦⠀⢀⣀⠀⠲⢍⣀⣀⠀\n' +
        '⠀⠀⡞⠀⠀⠀⢀⣿⠁⠀⠀⢀⣀⡸⣇⡀⠸⡇⠀⠀⡿⣆⣀⠹⣆⠀⣀⠴⠋⠀\n' +
        '⠀⢸⣷⣦⣤⣀⣾⠃⠀⠀⠀⣼⣏⣉⣉⡛⣾⠿⠇⢰⡭⢽⣧⠀⣿⡋⠁⠀⠀⠀\n' +
        '⢀⣾⣿⣿⣿⣿⠃⠀⠀⠀⢀⣾⠋⣤⣶⣐⠋⠀⣴⠃⣶⣶⡘⢷⣿⣷⡄⠀⠀⠀\n' +
        '⣿⣿⣿⣿⡿⠁⠀⣠⣶⢀⣼⡻⠴⠿⠛⠛⠀⠀⠀⠀⠙⠛⠓⠚⠻⣿⣿⣶⣤⣀\n' +
        '⣿⣿⣿⣯⣥⣴⣾⢻⣿⠞⢺⢷⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⡏⠁⠀\n' +
        '⠿⠿⠿⣿⣿⣿⣿⣧⣀⠀⠀⢃⠀⠀⠀⠀⠈⠉⠉⠁⠀⠀⠀⢀⣼⣿⣿⣷⠀⠀\n' +
        '⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣶⣼⣦⠀⠀⠀⠀⠀⠀⠀⢀⣀⣴⣿⣿⢻⣿⡟⠀⠀```'
    const display = {...main}
    display.color = ctx.colors.blue
    display.description += `\n${senko}\n`
    const select = new Selection('help').setOptions(helpSelect.all)
    return ctx.send(ctx, {
        embed: display,
        selection: [select],
        customButtons: [startPage],
        parent: back
    })
}

const displayHelpPage = async (ctx) => {
    const display = subMenus[ctx.arguments[0]]
    return ctx.send(ctx, {
        embed: display,
        customButtons: [startPage],
        parent: true
    })
}