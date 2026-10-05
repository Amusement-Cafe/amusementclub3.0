const router = require('express').Router()
const _ = require('lodash')
const UserCard = require('../../../db/userCard')

const BIO_MAX_LENGTH = 500
const TABLE_STYLES = ['single', 'double', 'mix', 'round']

const BOOLEAN_PREFS = {
    notify: ['aucCreated', 'aucBidMe', 'aucOutbid', 'aucNewBid', 'aucEnd', 'announce', 'daily', 'completed', 'effectEnd'],
    interact: ['canHas', 'canDiff', 'canSell', 'alwaysForce'],
    display: ['helpImages'],
}

const validatePreferences = async (user, input) => {
    if (!_.isPlainObject(input)) 
        return { error: 'preferences must be an object' }

    const current = user.preferences || {}
    const update = {}

    for (const [category, keys] of Object.entries(BOOLEAN_PREFS)) {
        if (input[category] === undefined) continue
        if (!_.isPlainObject(input[category])) return { error: `${category} must be an object` }
        for (const key of keys) {
            const value = input[category][key]
            if (value === undefined) continue
            if (typeof value !== 'boolean') return { error: `${category}.${key} must be true or false` }
            _.set(update, [category, key], value)
        }
    }

    // Suffixes of ascii-table3's unicode-* styles, as used by /stats and /preferences.
    if (input.display?.tables !== undefined) {
        if (!TABLE_STYLES.includes(input.display.tables)) return { error: `display.tables must be one of ${TABLE_STYLES.join(', ')}` }
        _.set(update, ['display', 'tables'], input.display.tables)
    }

    const profile = input.profile
    if (profile === undefined) return { update }
    if (!_.isPlainObject(profile)) return { error: 'profile must be an object' }

    const currentProfile = current.profile || {}
    const changed = key => profile[key] !== undefined && String(profile[key]) !== String(currentProfile[key] ?? '')
    const setProfile = (key, value) => _.set(update, ['profile', key], String(value))

    if (profile.bio !== undefined) {
        if (typeof profile.bio !== 'string') return { error: 'bio must be text' }
        if (changed('bio') && profile.bio.length > BIO_MAX_LENGTH) return { error: `Bio can be at most ${BIO_MAX_LENGTH} characters` }
        setProfile('bio', profile.bio)
    }

    if (changed('color')) {
        const color = Number(profile.color)
        if (!Number.isInteger(color) || color < 0 || color > 0xFFFFFF) return { error: 'color must be a colour between 0 and 16777215' }
        setProfile('color', color)
    }

    if (changed('title')) {
        if (profile.title !== '' && !(user.achievements || []).includes(profile.title)) {
            return { error: 'You can only use an achievement you have unlocked as your title' }
        }
        setProfile('title', profile.title)
    }

    if (changed('favComplete')) {
        if (profile.favComplete !== '' && !(user.completedCols || []).some(x => x.id === profile.favComplete)) {
            return { error: 'Your favourite completed collection must be one you have completed' }
        }
        setProfile('favComplete', profile.favComplete)
    }

    if (changed('favClout')) {
        if (profile.favClout !== '' && !(user.cloutedCols || []).some(x => x.id === profile.favClout)) {
            return { error: 'Your favourite clouted collection must be one you have clouted' }
        }
        setProfile('favClout', profile.favClout)
    }

    if (changed('card')) {
        if (profile.card !== '') {
            const cardID = Number(profile.card)
            const owned = Number.isInteger(cardID) && await UserCard.exists({ userID: user.userID, cardID, amount: { $ne: 0 } })
            if (!owned) return { error: 'You can only feature a card you own' }
        }
        setProfile('card', profile.card)
    }

    return { update }
}

router.get('/preferences', async (req, res) => res.status(200).send(req.user.preferences).end())

router.patch('/preferences', async (req, res) => {
    const {preferences} = req.body
    if (!preferences) {
        return res.status(400).send('Bad Request - preferences').end()
    }

    const { update, error } = await validatePreferences(req.user, preferences)
    if (error) {
        return res.status(400).send(error).end()
    }

    req.user.preferences = _.merge(req.user.preferences, update)
    await req.user.save()
    return res.status(200).end()
})

module.exports = router
