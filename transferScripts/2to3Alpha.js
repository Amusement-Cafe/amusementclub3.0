const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient

const {
    Announcements,
    Auctions,
    Cards,
    Claims,
    Collections,
    Guilds,
    GuildBuildings,
    GuildUsers,
    Heroes,
    Plots,
    Promos,
    Supports,
    Tags,
    Transactions,
    Users,
    UserCards,
    UserEffects,
    UserInventories,
    UserQuests,
    UserSlots,
    UserStats,
    UserWishlists
} = require('../db')

const main = async () => {
    const start = new Date()
    console.log('Connecting Mongoose')
    const mcn = await mongoose.connect('mongodb://127.0.0.1:27017/amuse3')
    console.log('Mongoose Connected')
    const dbc = await MongoClient.connect('mongodb://127.0.0.1:27017/')
    console.log('MongoDB Connected')
    const db = dbc.db('amusement2')
    console.log('Starting Transfers')
    await transferAnnouncements(db)
    await transferAuctions(db)
    await transferCards(db)
    await transferClaims(db)
    await transferCollections(db)
    await transferGuilds(db)
    await transferGuildBuildings(db)
    await transferGuildUsers(db)
    await transferHeroes(db)
    await transferPlots(db)
    await transferPromos(db)
    await transferKofis(db)
    await transferTags(db)
    await transferTransactions(db)
    await transferUsers(db)
    await transferUserCards(db)
    await transferUserEffects(db)
    await transferUserInventories(db)
    await transferUserQuests(db)
    await transferUserSlots(db)
    await transferUserStats(db)
    await transferUserWishlists(db)
    await updateEvalStats()
    const end = new Date()
    const timeTaken = (end - start) / 1000 / 60
    console.log(`Process took ${timeTaken} minutes to complete, or ${timeTaken / 60} hours`)
    process.exit(0)
}

const transferAnnouncements = async (db) => {
    const announcements = db.collection('announcements').find()
    console.log('Processing Announcements')
    let count = 1
    for (let a = await announcements.next(); a != null; a = await announcements.next()) {
        console.log(`Processing Announcement ${count}`)
        const announce = await new Announcements()
        announce.date = a.date
        announce.title = a.title
        announce.body = a.body
        announce.notify = false
        announce.expires = true
        await announce.save()
        count++
    }

    console.log('Finished Processing Announcements')
}

const transferAuctions = async (db) => {
    const auctions = db.collection('auctions').find()
    console.log('Processing Auctions')
    let count = 1
    for (let a = await auctions.next(); a != null; a = await auctions.next()) {
        console.log(`Processing Auction ${count}`)
        const auction = await new Auctions()
        auction.auctionID = a.id
        auction.ended = a.finished
        auction.cancelled = a.cancelled
        auction.price = a.price
        auction.highBid = a.highbid
        auction.userID = a.author
        auction.cardID = a.card
        auction.lastBidderID = a.lastbidder
        auction.bids = a.bids
        auction.expires = a.expires
        auction.time = a.time
        auction.guildID = a.guild
        await auction.save()
        count++
    }
    console.log('Finished Processing Auctions')
}

const transferCards = async (db) => {
    const cardJSON = require('../../ayano/data/cards.json')
    const cardInfos = db.collection('cardinfos').find()
    console.log('Processing Cards')
    let count = 1
    for (let c = await cardInfos.next(); c != null; c = await cardInfos.next()) {
        console.log(`Processing Card ${count}`)
        let json = cardJSON.find(x => x.id === c.id)
        const card = await new Cards()
        card.cardID = json.id
        card.rarity = json.level
        card.animated = json.animated
        card.collectionID = json.col
        card.cardName = json.name.replaceAll('_', ' ')
        card.displayName = card.cardName.split(' ').map(s => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(' ')
        card.cardURL = `https://c.amu.cards/id/${card.cardID}`
        card.added = c.meta.added
        card.lastUpdatedEval = new Date(0)
        card.eval = -1
        card.ratingSum = c.ratingsum
        card.timesRated = c.usercount
        card.ownerCount = c.ownercount
        card.meta = {
            booruID: c.meta.booruid,
            booruScore: c.meta.booruscore,
            booruRating: c.meta.boorurating,

            artist: c.meta.artist,
            pixivID: c.meta.pixivid,
            source: c.meta.source,
            image: c.meta.image,

            userID: c.meta.author,
            contributor: c.meta.contributor
        }
        await card.save()
        count++
    }
    console.log('Finished Processing Cards')
}

const transferClaims = async (db) => {
    const oldClaims = db.collection('claims').find()
    console.log('Processing Claims')
    let count = 1
    for (let c = await oldClaims.next(); c != null; c = await oldClaims.next()) {
        console.log(`Processing Claim ${count}`)
        const claim = await new Claims()
        claim.claimID = c.id
        claim.userID = c.user
        claim.guildID = c.guild
        claim.cardIDs = c.cards
        claim.cost = c.cost
        claim.promo = c.promo
        claim.lockCol = c.lock
        claim.timeClaimed = c.date
        await claim.save()
        count++
    }
    console.log('Finished Processing Claims')
}

const transferCollections = async (db) => {
    const colsJSON = require('../../ayano/data/collections.json')
    console.log('Processing Collections')
    let count = 1
    await Promise.all(colsJSON.map(async col => {
        console.log(`Processing Collection ${count}`)
        const newCol = await new Collections()
        newCol.collectionID = col.id
        newCol.name = col.name
        newCol.origin = col.origin
        newCol.aliases = col.aliases
        newCol.promo = col.promo || false
        newCol.compressed = col.compressed
        newCol.dateAdded = col.dateAdded
        newCol.creatorID = col.author
        if (col.rarity) {
            newCol.rarity = col.rarity
        }
        await newCol.save()
        count++
    }))
    console.log(`Finished Processing Collections`)
}

const transferGuilds = async (db) => {
    const oldGuilds = db.collection('guilds').find()
    console.log('Processing Guilds')
    let count = 1
    for (let g = await oldGuilds.next(); g != null; g = await oldGuilds.next()) {
        console.log(`Processing Guild ${count}`)
        const newGuild = await new Guilds()
        newGuild.guildID = g.id
        newGuild.lockCol = g.lock? g.lock: g.overridelock? g.overridelock: ''
        newGuild.ownerID = g.ownerid
        newGuild.reportChannel = g.reportchannel
        newGuild.hero = g.hero

        newGuild.xp = g.xp
        newGuild.tax = g.tax
        newGuild.tomatoes = g.balance
        newGuild.lemons = g.lemons
        newGuild.buildPerms = g.buildperm
        newGuild.discount = g.discount
        newGuild.heroLoyalty = g.heroloyalty

        newGuild.nextCheck = g.nextcheck
        newGuild.lastLock = g.lastlock

        newGuild.adminLock = !!g.overridelock
        newGuild.lockActive = g.lockactive
        newGuild.processing = g.processing
        await newGuild.save()
        count++
    }
    console.log('Finished Processing Guilds')
}

const transferGuildBuildings = async (db) => {
    const oldGuildBuildings = db.collection('guildbuildings').find()
    console.log('Processing GuildBuildings')
    let count = 1
    for (let gb = await oldGuildBuildings.next(); gb != null; gb = await oldGuildBuildings.next()) {
        console.log(`Processing Guild Building ${count}`)
        const newBuilding = await new GuildBuildings()
        newBuilding.guildID = gb.guildid
        newBuilding.buildingID = gb.id
        newBuilding.level = gb.level
        newBuilding.health = gb.health
        await newBuilding.save()
        count++
    }
    console.log('Finished Processing GuildBuildings')
}

const transferGuildUsers = async (db) => {
    const oldGuildUsers = db.collection('guildusers').find()
    console.log('Processing GuildUsers')
    let count = 1
    for (let gu = await oldGuildUsers.next(); gu != null; gu = await oldGuildUsers.next()) {
        console.log(`Processing Guild User ${count}`)
        const newGU = await new GuildUsers()
        newGU.userID = gu.userid
        newGU.guildID = gu.guildid
        newGU.xp = gu.xp
        newGU.level = gu.level
        newGU.donations = gu.donated
        newGU.roles = gu.roles
        await newGU.save()
        count++
    }
    console.log('Finished Processing GuildUsers')
}

const transferHeroes = async (db) => {
    const oldHeroes = db.collection('heros').find()
    console.log('Processing Heroes')
    let count = 1
    for (let h = await oldHeroes.next(); h != null; h = await oldHeroes.next()) {
        console.log(`Processing Hero ${count}`)
        const hero = await new Heroes()
        hero.heroID = h.id
        hero.name = h.name
        hero.userID = h.user
        hero.xp = h.xp
        hero.followers = h.followers
        hero.accepted = h.accepted
        hero.active = h.active
        hero.submitted = h.submitted
        hero.pictures = h.pictures
        await hero.save()
        count++
    }
    console.log('Finished Processing Heroes')
}

const transferPlots = async (db) => {
    const oldPlots = db.collection('plots').find()
    console.log('Processing Plots')
    let count = 1
    for (let p = await oldPlots.next(); p != null; p = await oldPlots.next()) {
        console.log(`Processing Plot ${count}`)
        const plot = await new Plots()
        plot.guildID = p.guild_id
        plot.userID = p.user_id
        plot.nextCheck = p.next_check
        if (p.building) {
            plot.building = {
                installed: p.building.install_date,
                lastCollected: p.building.last_collected,
                buildingID: p.building.id,
                level: p.building.level,
                storedLemons: p.building.stored_lemons,
                storedCards: []
            }
        }
        await plot.save()
        count++
    }
    console.log('Finished Processing Plots')
}

const transferPromos = async (db) => {
    const promoJSON = require('../../ayano/data/promos.json')
    const boostJSON = require('../../ayano/data/boosts.json')
    console.log('Processing Promos')
    let count = 1
    await Promise.all(promoJSON.map(async (promo) => {
        console.log(`Processing Promo ${count}`)
        const newPromo = await new Promos()
        newPromo.promoID = promo.id
        newPromo.promoName = promo.name
        newPromo.promoCurrency = promo.currency
        newPromo.starts = promo.starts
        newPromo.expires = promo.expires
        await newPromo.save()
        count++
    }))
    count = 1
    console.log(`Processing Boosts`)
    await Promise.all(boostJSON.map(async (boost) => {
        console.log(`Processing Boost ${count}`)
        const newBoost = await new Promos()
        newBoost.promoID = boost.id
        newBoost.promoName = boost.name
        newBoost.starts = boost.starts
        newBoost.expires = boost.expires
        newBoost.dropRate = boost.rate
        newBoost.cardIDs = boost.cards
        newBoost.isBoost = true
        await newBoost.save()
        count++
    }))
    console.log(`Finished Processing Boosts and Promos`)
}

const transferKofis = async (db) => {
    const oldSupport = db.collection('kofis').find()
    console.log('Processing Kofis')
    let count = 1
    for (let os = await oldSupport.next(); os != null; os = await oldSupport.next()) {
        console.log(`Processing Kofi ${count}`)
        const support = await new Supports()
        support.transactionID = os.transaction_id
        support.url = os.url
        support.type = os.type
        support.amount = os.amount
        support.received = os.timestamp
        await support.save()
        count++
    }
    console.log(`Finished Processing Kofis`)
}

const transferTags = async (db) => {
    const oldTags = db.collection('tags').find()
    console.log('Processing Tags')
    let count = 1
    for (let t = await oldTags.next(); t != null; t = await oldTags.next()) {
        console.log(`Processing Tag ${count}`)
        const tag = await new Tags()
        tag.tagName = t.name
        tag.userID = t.author
        tag.status = t.status
        tag.cardID = t.card
        tag.upvotes = t.upvotes
        tag.downvotes = t.downvotes
        await tag.save()
        count++
    }
    console.log(`Finished Processing Tags`)
}

const transferTransactions = async (db) => {
    const oldTransactions = db.collection('transactions').find()
    console.log('Processing Transactions')
    let count = 1
    for (let tr = await oldTransactions.next(); tr != null; tr = await oldTransactions.next()) {
        console.log(`Processing Transaction ${count}`)
        const transaction = await new Transactions()
        transaction.transactionID = tr.id
        transaction.toID = tr.to_id
        transaction.fromID = tr.from_id
        transaction.status = tr.status
        transaction.guildID = tr.guild_id
        transaction.cost = tr.price
        transaction.cardIDs = tr.cards
        transaction.dateCreated = tr.time
        await transaction.save()
        count++
    }
    console.log(`Finished Processing Transactions`)
}

const transferUsers = async (db) => {
    const oldUsers = db.collection('users').find()
    console.log('Processing Users')
    let count = 1
    for (let u = await oldUsers.next(); u != null; u = await oldUsers.next()) {
        console.log(`Processing User ${count}`)
        const user = await new Users()
        user.userID = u.discord_id
        user.username = u.username
        user.tomatoes = u.exp
        user.vials = u.vials
        user.lemons = u.lemons
        user.promoBal = u.promoexp
        user.xp = u.xp
        user.ban.full = u.ban?.full || false
        user.ban.embargo = u.ban?.embargo || false
        user.ban.report = u.ban?.report || false
        user.ban.tags = u.ban?.tags || 0
        user.completedCols = u.completedcols
        user.cloutedCols = u.cloutedcols
        user.achievements = u.achievements
        user.lastDaily = u.lastdaily
        user.lastAnnounce = u.lastannounce
        user.lastMsg = u.lastmsg
        user.lastCard = u.lastCard
        user.hero = u.hero
        user.heroChanged = u.herochanged
        user.heroSubmits = u.herosubmits
        user.roles = u.roles
        user.joined = u.joined
        user.premium.active = u.premium
        user.premium.expires = u.premiumExpires
        user.preferences = {
            notify: {
                aucBidMe:   u.prefs.notifications.aucbidme,
                aucOutbid:  u.prefs.notifications.aucoutbid,
                aucNewBid:  u.prefs.notifications.aucnewbid,
                aucEnd:     u.prefs.notifications.aucend,
                announce:   u.prefs.notifications.announce,
                daily:      u.prefs.notifications.daily,
                completed:  u.prefs.notifications.completed,
                effectEnd:  u.prefs.notifications.effectend,
            },
            interact: {
                canHas:     u.prefs.interactions.canhas,
                canDiff:    u.prefs.interactions.candiff,
                canSell:    u.prefs.interactions.cansell,
            },
            profile: {
                bio:        u.prefs.profile.bio,
                title:      u.prefs.profile.title,
                color:      u.prefs.profile.color,
                card:       u.prefs.profile.card,
                favComplete:u.prefs.profile.favcomplete,
                favClout:   u.prefs.profile.favclout,
            }
        }
        user.streaks = {
            daily: {
                count: u.streaks.daily
            },
            donations: {
                kofi: {
                    streak: u.streaks.kofi
                }
            },
            effects: {
                memoryVal: u.effectusecount.memoryval,
                memoryBday: u.effectusecount.memorybday,
                memoryHall: u.effectusecount.memoryhall,
                memoryXmas: u.effectusecount.memoryxmas,
                xmasSpace: u.effectusecount.xmasspace,
                hallSpace: u.effectusecount.hallspace,
                bdaySpace: u.effectusecount.bdayspace,
                valSpace: u.effectusecount.valspace,
            }
        }
        await user.save()
        count++
    }
    console.log(`Finished Processing Users`)
}

const transferUserCards = async (db) => {
    const oldUserCards = db.collection('usercards').find()
    console.log('Processing UserCards')
    let count = 1
    for (let uc = await oldUserCards.next(); uc != null; uc = await oldUserCards.next()) {
        console.log(`Processing User Card ${count}`)
        const userCard = await new UserCards()
        userCard.userID = uc.userid
        userCard.cardID = uc.cardid
        userCard.amount = uc.amount
        userCard.rating = uc.rating
        userCard.fav = uc.fav
        userCard.locked = uc.locked
        userCard.acquired = uc.obtained
        await userCard.save()
        count++
    }
    console.log(`Finished Processing UserCards`)
}

const transferUserEffects = async (db) => {
    const oldUserEffects = db.collection('usereffects').find()
    console.log('Processing UserEffects')
    let count = 1
    for (let ue = await oldUserEffects.next(); ue != null; ue = await oldUserEffects.next()) {
        console.log(`Processing UserEffects ${count}`)
        const userEffect = await new UserEffects()
        userEffect.userID = ue.userid
        userEffect.effectID = ue.id
        userEffect.usesLeft = ue.uses
        userEffect.cooldownEnds = ue.cooldownends
        userEffect.expires = ue.expires
        userEffect.notified = ue.notified
        await userEffect.save()
        count++
    }
    console.log(`Finished Processing UserEffects`)
}

const transferUserInventories = async (db) => {
    const oldInventories = db.collection('userinventories').find()
    console.log('Processing UserInventories')
    let count = 1
    for (let ui = await oldInventories.next(); ui != null; ui = await oldInventories.next()) {
        console.log(`Processing User Inventory ${count}`)
        const userInventory = await new UserInventories()
        userInventory.userID = ui.userid
        userInventory.itemID = ui.id
        userInventory.colID = ui.col
        userInventory.acquired = ui.acquired
        userInventory.cards = ui.cards
        await userInventory.save()
        count++
    }
    console.log(`Finished Processing UserInventories`)
}

const transferUserQuests = async (db) => {
    const oldUserQuests = db.collection('userquests').find()
    console.log('Processing UserQuests')
    let count = 1
    for (let uq = await oldUserQuests.next(); uq != null; uq = await oldUserQuests.next()) {
        console.log(`Processing User Quest ${count}`)
        const userQuest = await new UserQuests()
        userQuest.userID = uq.userid
        userQuest.questID = uq.questid
        userQuest.type = uq.type
        userQuest.completed = uq.completed
        userQuest.created = uq.created
        userQuest.expires = uq.expiry
        await userQuest.save()
        count++
    }
    console.log(`Finished Processing UserQuests`)
}

const transferUserSlots = async (db) => {
    const oldUserSlots = db.collection('userslots').find()
    console.log('Processing UserSlots')
    let count = 1
    for (let us = await oldUserSlots.next(); us != null; us = await oldUserSlots.next()) {
        console.log(`Processing User Slot ${count}`)
        const userSlot = await new UserSlots()
        userSlot.userID = us.discord_id
        userSlot.effectName = us.effect_name
        userSlot.slotExpires = us.slot_expires
        userSlot.cooldown = us.cooldown
        userSlot.active = us.is_active
        await userSlot.save()
        count++
    }
    console.log(`Finished Processing UserSlots`)
}

const transferUserStats = async (db) => {
    const oldUserStats = db.collection('userstats').find()
    console.log('Processing UserStats')
    let count = 1
    for (let us = await oldUserStats.next(); us != null; us = await oldUserStats.next()) {
        console.log(`Processing User Stat ${count}`)
        const newStat = await new UserStats()
        newStat.userID = us.discord_id
        newStat.username = us.username
        newStat.daily = us.daily
        newStat.claims = us.claims
        newStat.promoClaims = us.promoclaims
        newStat.totalRegularClaims = us.totalregclaims
        newStat.aucSell = us.aucsell
        newStat.aucBid = us.aucbid
        newStat.aucWin = us.aucwin
        newStat.liquefy = us.liquefy
        newStat.liquefy1 = us.liquefy1
        newStat.liquefy2 = us.liquefy2
        newStat.liquefy3 = us.liquefy3
        newStat.draw = us.draw
        newStat.draw1 = us.draw1
        newStat.draw2 = us.draw2
        newStat.draw3 = us.draw3
        newStat.forge = us.forge
        newStat.forge1 = us.forge1
        newStat.forge2 = us.forge2
        newStat.forge3 = us.forge3
        newStat.tags = us.tags
        newStat.rates = us.rates
        newStat.wish = us.wish
        newStat.userSell = us.usersell
        newStat.botSell = us.botsell
        newStat.userBuy = us.userbuy
        newStat.tomatoIn = us.tomatoin
        newStat.tomatoOut = us.tomatoout
        newStat.promoIn = us.promoin
        newStat.promoOut = us.promoout
        newStat.vialIn = us.vialin
        newStat.vialOut = us.vialout
        newStat.lemonIn = us.lemonin
        newStat.lemonOut = us.lemonout
        newStat.store = us.store
        newStat.store1 = us.store1
        newStat.store2 = us.store2
        newStat.store3 = us.store3
        newStat.store4 = us.store4
        newStat.t1Quests = us.t1quests
        newStat.t2Quests = us.t2quests
        newStat.t3Quests = us.t3quests
        newStat.t4Quests = us.t4quests
        newStat.t5Quests = us.t5quests
        newStat.t6Quests = us.t6quests
        await newStat.save()
        count++
    }
    console.log(`Finished Processing User Stats`)
}

const transferUserWishlists = async (db) => {
    const oldUsers = db.collection('users').find()
    console.log('Processing User Wishlists')
    let count = 1
    for (let u = await oldUsers.next(); u != null; u = await oldUsers.next()) {
        console.log(`Processing User Wishlist ${count}`)
        await Promise.all(u.wishlist.map(async w => {
            const userWish = await new UserWishlists()
            userWish.userID = u.discord_id
            userWish.cardID = w
            userWish.added = new Date()
            await userWish.save()
        }))
        count++
    }

    console.log(`Finished Processing User Wishlists`)
}

const updateEvalStats = async () => {
    console.log('Gathering Wishlists')
    const wishlists = await UserWishlists.find().lean()
    await Promise.all(wishlists.map(async (w, i) => {
        console.log(`Processing Wishlist ${i}`)
        await Cards.updateOne({cardID: w.cardID}, {$inc: {"stats.wishlistCount": 1}})
    }))
    console.log(`Finished Processing User Wishlists`)
    console.log(`Gathering Cards`)
    let cards = await Cards.find()
    for (let c of cards) {
        console.log(`Processing card ${c.cardID}`)
        console.log(`Finding card ${c.cardID} in User Cards`)
        const uCards = await UserCards.find({cardID: c.cardID}).lean()
        console.log(`Found Card in User Cards`)
        for (const uCard of uCards) {
            c.stats.totalCopies += uCard.amount
        }
        c.ownerCount = uCards.length
        console.log(`Finding Card in Transactions`)
        const cTrans = await Transactions.find({cardID: c.cardID, to: "bot", status: "confirmed"}).lean()
        for (const cTran of cTrans) {
            c.stats.soldToBot.push({
                date: cTran.dateCreated,
                cost: cTran.cost
            })
        }
        console.log(`Finding Card in Auctions`)
        const cAucs = await Auctions.find({cardID: c.cardID, ended: true, cancelled: false}).lean()
        for (const cAuc of cAucs) {
            if (cAuc.bids.length === 0) {
                c.stats.auctionReturned.push({
                    date: cAuc.time,
                })
            } else {
                c.stats.auctionSales.push({
                    cost: cAuc.price,
                    date: cAuc.time,
                })
            }
        }
        c.stats.auctionCount = cAucs.length
        console.log(`Finished with card ${c.cardID}`)
        await c.save()
        console.log(`Saved Card ${c.cardID}`)
    }
}
main()