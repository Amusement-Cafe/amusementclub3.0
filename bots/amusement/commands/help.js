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
    const display = {...main}
    if (ctx.user.roles.some(x => (x === 'admin' || x === 'mod'))) {
        display.description += '\nNo help for you\n```⠀⠀⠀⠀⠀⠀⠀⠀⣾⢆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⢧⠀⠀⠀⠀⠀⠀⠀\n' +
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
            '⠀⠀⣰⣿⣿⣿⣿⣿⣿⣿⣶⣼⣦⠀⠀⠀⠀⠀⠀⠀⢀⣀⣴⣿⣿⢻⣿⡟⠀⠀\n```'
    }
    const select = new Selection('help').setOptions(helpSelect.all)
    if (!ctx.user.preferences.display.helpImages && display.image) {
        display.image = undefined
    }
    const discordLinkButton = new Button('').setStyle(5).setURL(ctx.config.links.discord).setLabel('Join our Discord')
    return ctx.send(ctx, {
        embed: display,
        selection: [select],
        customButtons: [startPage, discordLinkButton],
        parent: back
    })
}

const displayHelpSubMenu = async (ctx) => {
    const display = {...subMenus[ctx.arguments[0]]}
    const selection = []
    if (helpSelect[ctx.arguments[0]]?.length > 0) {
        selection.push(new Selection('helpPage').setOptions(helpSelect[ctx.arguments[0]]))
    }
    if (!ctx.user.preferences.display.helpImages && display.image) {
        display.image = undefined
    }
    return ctx.send(ctx, {
        embed: display,
        selection,
        customButtons: [startPage],
        parent: true
    })
}

const displayHelpPage = async (ctx) => {
    const split = ctx.arguments.length > 1? ctx.arguments: ctx.arguments[0].split('-')
    let display = structuredClone(helpMenus[split[0]][split[1]])
    let page = 0
    if (!(display instanceof Array)) {
        display = [display]
    }
    if (split[2] !== undefined) {
        page = parseInt(split[2])
    }
    const customButtons = [startPage]
    if (display.length > 1) {
        let nextPage = page + 1
        let backPage = page - 1
        if (nextPage > display.length - 1) {
            nextPage = 0
        }
        if (backPage < 0) {
            backPage = display.length - 1
        }
        if (display.length > 2) {
            customButtons.push(new Button(`helpPage-${split[0]}-${split[1]}-${backPage}`).setLabel('Back').setStyle(1))
        }
        customButtons.push(new Button(`helpPage-${split[0]}-${split[1]}-${nextPage}`).setLabel('Next').setStyle(1))
    }
    display = display[page]
    if (!display.color) {
        display.color = ctx.colors.blue
    }
    if (!ctx.user.preferences.display.helpImages && display.image) {
        display.image = undefined
    }
    return ctx.send(ctx, {
        embed: display,
        selection: [new Selection('helpPage').setOptions(helpSelect[split[0]])],
        customButtons,
        parent: true
    })
}