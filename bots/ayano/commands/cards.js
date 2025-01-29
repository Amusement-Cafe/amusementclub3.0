const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {getS3Connection} = require("../helpers/s3");
const {Collections, Cards} = require('../../../db')
const {Collection} = require("mongoose");

let updating = false

registerBotCommand('update', async (ctx, extras) => {
    if (!ctx.s3)
        await getS3Connection(ctx)

    if (updating)
        return await ctx.interaction.reply({content: `An update is already in progress, please wait for it to finish and try again!`})

    const before = new Date()
    updating = true

    let newCards = []
    let responsePairs = []
    let response = ``

    // If NOT looking for a new collection
    if (ctx.args.colQuery) {
        let collectionCards = await new Promise((resolve, reject) => {
            let stream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, `cards/${ctx.args.colQuery}/`)
            let cards = []
            stream.on('data', (item) => {
                cards.push(item)})
            stream.on('error', (err) => reject(err))
            stream.on('end', () => resolve(cards))
        })
        newCards = collectionCards.filter(x => !ctx.cards.some(y => x.name.substring(`cards/${ctx.args.colQuery}/`.length).substring(-4).substring(2).replaceAll('_', ' ') === y.cardName))
        responsePairs.push(`${ctx.args.colQuery}:${newCards.length}`)
    } else {
        let collectionList = await new Promise((resolve, reject) => {
            let stream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, 'cards/')
            let list = []
            stream.on('data', (item) => {
                list.push(item)})
            stream.on('error', (err) => reject(err))
            stream.on('end', () => resolve(list))
        })
        collectionList = collectionList.filter(x => !ctx.collections.some(y => x.prefix.substring(5).substring(-1).replaceAll(`/`, '') === y.collectionID))
        if (collectionList.length > 0) {
            let multiCards = []
            for (let c of collectionList) {

                const collection = await new Collections()
                collection.collectionID = c.prefix.substring(5).substring(-1).replaceAll(`/`, '')
                collection.name = c.prefix.substring(5).substring(-1).replaceAll(`/`, '')
                collection.promo = ctx.args.promo || false
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
            ctx.collections = await Collections.find().lean()
        }
    }

    if (newCards.length === 0) {
        return ctx.interaction.reply({content: `There was nothing to add!`})
    }
    console.log(responsePairs)

    let lastID = ctx.cards?.sort((a, b) => b.cardID - a.cardID)[0]?.cardID || 0
    console.log(ctx.cards?.sort((a, b) => b.cardID - a.cardID)[0])
    for (let card of newCards) {
        const fileName = card.name.split('/')[2]
        const name = fileName.substring(2, fileName.length - 4).replaceAll('_', ' ').split(' ').map(s => s[0].toUpperCase() + s.slice(1).toLowerCase()).join(' ')

        const newCard = await new Cards()
        newCard.cardID = lastID + 1
        newCard.rarity = parseInt(card.name.split('/')[2].split('_').shift())
        newCard.animated = card.name.split('/')[2].split('.')[1] === 'gif'
        newCard.collectionID = card.name.split('/')[1]
        newCard.cardName = name
        newCard.displayName = name
        newCard.added = new Date()
        await newCard.save()
        lastID++
    }

    responsePairs.forEach((thingAdded) => {
        const split = thingAdded.split(':')
        response += `${split[0]} has received ${split[1]} new cards\n`
    })

    const after = new Date()
    updating = false
    ctx.cards = await Cards.find().lean()
    return await ctx.interaction.reply({content: `That took ${after - before}ms or ${(after - before) / 1000} seconds, is that too long?`, embeds: [{
        description: response.substring(0, 4095)
        }]})

    // data.on('data', (item) => console.log(item))
    // data.on('error', (err) => console.log(err))
    await extras.interaction.reply({content: content})
    // await extras.interaction.reply({content:'It works'})
})