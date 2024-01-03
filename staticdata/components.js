module.exports = {
    /*
    Button Class
    Requires an id to be passed upon creation
    IDs can be up to 100 characters long
     */
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