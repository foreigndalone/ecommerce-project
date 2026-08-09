import { createHmac, timingSafeEqual } from 'node:crypto'

const unauthorized = (res, message = 'Unauthorized') =>
    res.status(401).json({ message })

const decodeJsonPart = (part) =>
    JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))

export const verifyJwtToken = (token, secret = process.env.JWT_SECRET) => {
    if (!secret) {
        throw new Error('JWT_SECRET is not configured')
    }

    const parts = typeof token === 'string' ? token.split('.') : []

    if (parts.length !== 3) {
        throw new Error('Invalid token')
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = decodeJsonPart(encodedHeader)

    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
        throw new Error('Unsupported token')
    }

    const expectedSignature = createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    const actualSignature = Buffer.from(encodedSignature, 'base64url')

    if (
        actualSignature.length !== expectedSignature.length
        || !timingSafeEqual(actualSignature, expectedSignature)
    ) {
        throw new Error('Invalid token signature')
    }

    const payload = decodeJsonPart(encodedPayload)
    const currentTime = Math.floor(Date.now() / 1000)

    if (typeof payload.exp !== 'number' || payload.exp <= currentTime) {
        throw new Error('Token has expired')
    }

    if (typeof payload.sub !== 'string' || !payload.sub) {
        throw new Error('Invalid token subject')
    }

    return payload
}

export const requireAuth = (req, res, next) => {
    const authorization = req.get?.('authorization') ?? req.headers?.authorization
    const match = typeof authorization === 'string'
        ? authorization.match(/^Bearer\s+(.+)$/i)
        : null

    if (!match) {
        return unauthorized(res, 'Authorization token is required')
    }

    try {
        req.user = verifyJwtToken(match[1])
        return next()
    } catch {
        return unauthorized(res, 'Invalid or expired authorization token')
    }
}

export default requireAuth
