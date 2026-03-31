const globalCommands = []
const guildCommands = []

class BuildCommand {
    constructor (type, name, description, parent = null) {
        this.type = type
        this.name = name
        this.description = description
        this.parent = parent
        this.options = []
        this.currentOption = null
    }

    close () {
        return this.parent ?? this
    }

    subCommandGroup (name, description) {
        const subCommandGroup = new BuildCommand(2, name, description, this)
        this.options.push(subCommandGroup)
        return subCommandGroup
    }

    subCommand (name, description) {
        const subCommand = new BuildCommand(1, name, description, this)
        this.options.push(subCommand)
        return subCommand
    }

    string (name, description) {
        return this.optionBuilder(3, name, description)
    }

    cardQuery () {
        return this.optionBuilder(3, 'card_query', 'Filter for specific cards, see help for query options')
    }

    integer (name, description) {
        return this.optionBuilder(4, name, description)
    }

    boolean (name, description) {
        return this.optionBuilder(5, name, description)
    }

    user (name, description) {
        return this.optionBuilder(6, name, description)
    }

    userID (description) {
        return this.optionBuilder(6, 'user_id', description)
    }

    channel (name, description) {
        return this.optionBuilder(7, name, description)
    }

    role (name, description) {
        return this.optionBuilder(8, name, description)
    }

    mentionable (name, description) {
        return this.optionBuilder(9, name, description)
    }

    number (name, description) {
        return this.optionBuilder(10, name, description)
    }

    attachment (name, description) {
        return this.optionBuilder(11, name, description)
    }

    required (value = true) {
        this.currentOption.required = value
        return this
    }

    minValue (value) {
        this.currentOption.minValue = value
        return this
    }

    maxValue (value) {
        this.currentOption.maxValue = value
        return this
    }

    minLength (length) {
        this.currentOption.minLength = length
        return this
    }

    maxLength (length) {
        this.currentOption.maxLength = length
        return this
    }

    optionBuilder (type, name, description) {
        this.currentOption = {type, name, description}
        this.options.push(this.currentOption)
        return this
    }

    toJSON () {
        const obj = {
            type: this.type,
            name: this.name,
            description: this.description
        }

        if (this.options.length > 0) {
            obj.options = this.options.map((option) => option.toJSON ? option.toJSON() : option)
        }

        return obj
    }
}

const generateGlobalCommand = (name, description) => {
    const builder = new BuildCommand(1, name, description)
    globalCommands.push(builder)
    return builder
}

const generateGuildCommand = (name, description) => {
    const builder = new BuildCommand(1, name, description)
    guildCommands.push(builder)
    return builder
}

const getGlobalCommands = () => globalCommands.map(gc => gc.toJSON())

const getGuildCommands = () => guildCommands.map(gc  => gc.toJSON())

module.exports = {
    generateGlobalCommand,
    getGlobalCommands,
    getGuildCommands,
    generateGuildCommand,
}