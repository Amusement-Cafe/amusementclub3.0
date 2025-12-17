const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {getS3Connection} = require("../helpers/s3");
const {Collections, Cards} = require('../../../db')

let updating = false



//Todo Rename S3 card file to cardID once imported, and use that for links
registerBotCommand('update', async (ctx, extras) => {
    if (!ctx.s3)
        await getS3Connection(ctx)

    if (updating)
        return await ctx.send(ctx, `An update is already in progress, please wait for it to finish and try again!`)

    const before = new Date()
    updating = true

    let newCards = []
    let responsePairs = []
    let response = ``

    // If NOT looking for a new collection
    if (ctx.args.colQuery) {
        for (let col of ctx.args.cols) {
            let collectionCards = await new Promise((resolve, reject) => {
                let stream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, `cards/${col}/`)
                let cards = []
                stream.on('data', (item) => cards.push(item))
                stream.on('error', (err) => reject(err))
                stream.on('end', () => resolve(cards))
            })
            newCards = collectionCards.filter(x => !ctx.cards.some(y => {
                let fileName = x.name.split('/')[2]
                return fileName.substring(2, fileName.length - 4).replaceAll('_', ' ') === y.cardName
            }))
            responsePairs.push(`${ctx.args.colQuery}:${newCards.length}`)
        }
    } else {
        let collectionList = await new Promise((resolve, reject) => {
            let stream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, 'cards/')
            let list = []
            stream.on('data', (item) => {
                list.push(item)})
            stream.on('error', (err) => reject(err))
            stream.on('end', () => resolve(list))
        })
        collectionList = collectionList.filter(x => !ctx.collections.some(y => x.prefix && x.prefix.substring(5).replaceAll(`/`, '') === y.collectionID))
        if (collectionList.length > 0) {
            let multiCards = []
            for (let c of collectionList) {
                if (!c.prefix) {
                    continue
                }
                let colName = c.prefix.substring(5).replaceAll(`/`, '')
                const collection = await new Collections()
                collection.collectionID = colName
                collection.name = colName
                collection.promo = ctx.args.promo || false
                collection.aliases = [colName]
                await collection.save()

                let colCards = await new Promise((resolve, reject) => {
                    let cardStream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, c.prefix, true)
                    let cardList = []
                    cardStream.on('data', (item) => {
                        cardList.push(item)
                    })
                    cardStream.on('error', (err) => reject(err))
                    cardStream.on("end", () => resolve(cardList))
                })
                multiCards.push(colCards)
                responsePairs.push(`**NEW** ${collection.name}:${colCards.length}`)
            }
            newCards = multiCards.flat()
            ctx.global.collections = await Collections.find()
        }
    }

    if (newCards.length === 0) {
        updating = false
        return ctx.send(ctx, `There was nothing to add!`)
    }

    let lastID = ctx.cards?.sort((a, b) => b.cardID - a.cardID)[0]?.cardID || 0
    for (let card of newCards) {
        const fileName = card.name.split('/')[2]
        const name = fileName.substring(2, fileName.length - 4).replaceAll('_', ' ')

        const newCard = await new Cards()
        newCard.cardID = lastID + 1
        newCard.rarity = parseInt(card.name.split('/')[2].split('_').shift())
        newCard.animated = card.name.split('/')[2].split('.')[1] === 'gif'
        newCard.collectionID = card.name.split('/')[1]
        newCard.cardName = name
        newCard.displayName = name.split(' ').map(s => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(' ')
        newCard.added = new Date()
        newCard.cardURL = `https://c.amu.cards/id/${newCard.cardID}${newCard.animated? '.gif': ''}`
        newCard.canDrop = !ctx.args.promo
        await newCard.save()
        lastID++
    }

    responsePairs.forEach((thingAdded) => {
        const split = thingAdded.split(':')
        response += `${split[0]} has received ${split[1]} new cards\n`
    })

    const after = new Date()
    updating = false
    ctx.global.cards = await Cards.find()
    return ctx.send(ctx, {
        content: `That took ${after-before}ms!`,
        embed: {
            description: response.substring(0, 4095)
        }
    })
})