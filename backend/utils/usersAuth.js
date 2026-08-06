import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const JWT_TTL_SECONDS = 60 * 60

export const normalizeEmail = (email) => email.toLowerCase().trim()

export const hashPassword = async (password) => {
    const salt = randomBytes(16)
    const derivedKey = await scryptAsync(password, salt, 64)

    return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

export const verifyPassword = async (password, storedHash) => {
    const [algorithm, saltHex, hashHex] = storedHash?.split('$') ?? []

    if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false

    const expectedHash = Buffer.from(hashHex, 'hex')

    if (expectedHash.length === 0) return false

    const actualHash = await scryptAsync(
        password,
        Buffer.from(saltHex, 'hex'),
        expectedHash.length
    )

    return actualHash.length === expectedHash.length
        && timingSafeEqual(actualHash, expectedHash)
}

export const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.normalizedEmail,
    createdAt: user.createdAt,
})

export const createJwtToken = (user) => {
    const secret = process.env.JWT_SECRET

    if (!secret) {
        throw new Error('JWT_SECRET is not configured')
    }

    const issuedAt = Math.floor(Date.now() / 1000)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
        .toString('base64url')
    const payload = Buffer.from(JSON.stringify({
        sub: user.id,
        email: user.email,
        iat: issuedAt,
        exp: issuedAt + JWT_TTL_SECONDS,
    })).toString('base64url')
    const signature = createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url')

    return `${header}.${payload}.${signature}`
}
