const {getConfig} = require('../../../utils/fileHelpers')
const Minio = require('minio')


const getS3Connection = async (ctx) => {
    if (!ctx.config)
        ctx.config = await getConfig()

    if (ctx.s3)
        return ctx.s3

    ctx.s3 = new Minio.Client({
        useSSL: false,
        endPoint: ctx.config.minio.endpoint,
        port: ctx.config.minio.port,
        region: ctx.config.minio.region,
        accessKey: ctx.config.minio.s3accessKeyId,
        secretKey: ctx.config.minio.s3secretAccessKey,
        signatureVersion: ctx.config.minio.signatureVersion,
        forcePathStyle: ctx.config.minio.s3ForcePathStyle,
    })
    return ctx.s3
}


module.exports = {
    getS3Connection
}