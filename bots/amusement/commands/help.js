const {
    registerBotCommand,
    registerReaction
} = require('../../../utils/commandRegistrar')

const {
    generateGlobalCommand
} = require("../../../utils/commandGeneration")

const {
    Button,
    Selection
} = require("../helpers/componentBuilders")

const {
    main,
    subMenus,
    helpMenus,
} = require('../static/embeds/help')

const helpSelect = require('../static/menus/help/help.json')

const startPage = new Button('helpStart').setLabel('Main Menu').setStyle(2)

registerBotCommand('help', async (ctx) => await helpStart(ctx))
generateGlobalCommand('help', 'Access the help menus')

registerReaction('help', async (ctx) => await displayHelpSubMenu(ctx))
registerReaction('helpStart', async (ctx) => await helpStart(ctx, true))
registerReaction('helpPage', async (ctx) => await displayHelpPage(ctx))


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

const displayHelpSubMenu = async (ctx) => {
    const display = subMenus[ctx.arguments[0]]
    const selection = []
    if (helpSelect[ctx.arguments[0]]?.length > 0) {
        selection.push(new Selection('helpPage').setOptions(helpSelect[ctx.arguments[0]]))
    }
    return ctx.send(ctx, {
        embed: display,
        selection,
        customButtons: [startPage],
        parent: true
    })
}

const displayHelpPage = async (ctx) => {
    const split = ctx.arguments[0].split('-')
    const display = helpMenus[split[0]][split[1]]
    return ctx.send(ctx, {
        embed: display,
        selection: [new Selection('helpPage').setOptions(helpSelect[split[0]])],
        customButtons: [startPage],
        parent: true
    })
}