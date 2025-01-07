const {registerBotCommand} = require('../../../utils/commandRegistrar')
const {getS3Connection} = require("../helpers/s3");
const {Collections} = require('../../../db')

registerBotCommand('rename', async (ctx, something, extras) => {
    if (!ctx.s3)
        await getS3Connection(ctx)

    // console.log(await ctx.s3.listObjects(ctx.config.minio.bucket, '/cards'))
    let data = await new Promise((resolve, reject) => {
        let stream = ctx.s3.listObjectsV2(ctx.config.minio.bucket, 'cards/')
        let list = []
        stream.on('data', (item) => {list.push(item)})
        stream.on('error', (err) => reject(err))
        stream.on('end', () => resolve(list))
    })

    let collections = await Collections.find()

    let content = ''
    if (collections.length !== data.length) {
        console.log('hello?')
        let added = []
        console.log(data)
        data = data.filter(x => {
            return !collections.some(y => x.prefix.substring(5).substring(-1).replaceAll(`/`, '') === y.collectionID)
        })
        console.log(data)
        for (let x of data) {
            console.log(x)
            const collection = await new Collections()
            collection.collectionID = x.prefix.substring(5).substring(-1).replaceAll(`/`, '')
            collection.name = x.prefix.substring(5).substring(-1).replaceAll(`/`, '')
            await collection.save()
            added.push(x.prefix.substring(5).substring(-1).replaceAll(`/`, ''))
            content += `${x.prefix.substring(5).substring(-1).replaceAll(`/`, '')} added\n`
        }
        console.log(added)
    }

    // data.on('data', (item) => console.log(item))
    // data.on('error', (err) => console.log(err))
    await extras.interaction.reply({content: content})
    // await extras.interaction.reply({content:'It works'})
})