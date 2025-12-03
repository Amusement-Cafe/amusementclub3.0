module.exports = {
    Selection: class Selection {
        constructor(id) {
            this.type = 3
            this.customID = id
        }
        setOptions (options) {
            this.options = options
            return this
        }
    },
    Button: class Button {
        constructor(id) {
            this.type = 2
            this.customID = id
        }
        /*
        Style types are:
        1: blue
        2: grey
        3: green
        4: red
        5: link
         */
        setStyle (style) {
            this.style = style
            return this
        }
        setLabel (label) {
            this.label = label
            return this
        }
        setEmoji(emote){
            this.emoji = emote
            return this
        }
        setOff(off = true) {
            this.disabled = off
            return this
        }
    }
}