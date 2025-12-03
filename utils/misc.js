const { randomUUID } = require('crypto')

const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz0123456789"

const uuidToBigInt = (uuid) => {
    return BigInt("0x" + uuid.replace(/-/g, ""))
}

const bigIntToUUID = (bigInt) => {
    let hex = bigInt.toString(16).padStart(32, "0")
    return (
        hex.slice(0, 8) +
        "-" +
        hex.slice(8, 12) +
        "-" +
        hex.slice(12, 16) +
        "-" +
        hex.slice(16, 20) +
        "-" +
        hex.slice(20)
    )
}

const encodeBaseN = (bigInt, alphabet) => {
    const base = BigInt(alphabet.length)
    let output = ""
    while (bigInt > 0n) {
        output = alphabet[Number(bigInt % base)] + output
        bigInt /= base
    }
    return output;
}

function decodeBaseN(str, alphabet) {
    const base = BigInt(alphabet.length)
    const indexMap = new Map()
    alphabet.split("").forEach((c, i) => indexMap.set(c, BigInt(i)))

    let value = 0n
    for (const c of str) {
        value = value * base + indexMap.get(c)
    }
    return value
}

function encodeUUID(uuid, minLength = 22) {
    let bi = uuidToBigInt(uuid)
    let encoded = encodeBaseN(bi, alphabet)

    if (encoded.length < minLength) {
        encoded = alphabet[0].repeat(minLength - encoded.length) + encoded
    }

    return encoded
}

function decodeUUID(encoded) {
    const bi = decodeBaseN(encoded, alphabet)
    return bigIntToUUID(bi)
}

const generateNewID = () => {
    return randomUUID()
}

module.exports = {
    decodeUUID,
    encodeUUID,
    generateNewID,
}