// path: src/models/usersModel.js
import { promisify } from 'node:util'
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { getDb } from '../config/db.js'

const COLLECTION_NAME = 'users'
const scryptAsync = promisify(scrypt)

// GET COLLECTION
const getCollection = () => getDb().collection(COLLECTION_NAME)

const normalizeEmail = (email) => email.trim().toLowerCase()

const toPublicUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.normalizedEmail,
})

const hashPassword = async (password) => {
    const salt = randomBytes(16)
    const derivedKey = await scryptAsync(password, salt, 64)
    return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

const verifyPassword = async (password, storedHash) => {
    const [algorithm, saltHex, hashHex] = storedHash?.split('$') ?? []

    if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false

    const expectedHash = Buffer.from(hashHex, 'hex')
    const actualHash = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expectedHash.length)

    return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash)
}

// Create user
export const createUserModel = async (userData) => {
    const collection = getCollection()
    const user = {
        name: userData.name,
        normalizedEmail: normalizeEmail(userData.email),
        passwordHash: await hashPassword(userData.password),
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    const result = await collection.insertOne(user)

    return toPublicUser({ _id: result.insertedId, ...user })
}

export const authenticateUserModel = async ({ email, password }) => {
    const user = await getCollection().findOne({ normalizedEmail: normalizeEmail(email) })

    if (!user || !await verifyPassword(password, user.passwordHash)) return null

    return toPublicUser(user)
}

export const ensureUsersEmailIndex = async () => {
    const collection = getCollection()
    const users = await collection.find(
        { email: { $type: 'string' } },
        { projection: { email: 1, password: 1, passwordHash: 1 } }
    ).sort({ _id: 1 }).toArray()
    const claimedEmails = new Set()

    for (const user of users) {
        const normalizedEmail = normalizeEmail(user.email)
        const hasConflict = !normalizedEmail || claimedEmails.has(normalizedEmail)
        const passwordUpdate = !user.passwordHash && typeof user.password === 'string'
            ? { passwordHash: await hashPassword(user.password) }
            : {}

        if (hasConflict) {
            await collection.updateOne(
                { _id: user._id },
                {
                    $unset: { normalizedEmail: '', password: '' },
                    $set: { emailConflict: normalizedEmail || 'invalid', ...passwordUpdate },
                }
            )
            continue
        }

        claimedEmails.add(normalizedEmail)
        await collection.updateOne(
            { _id: user._id },
            {
                $set: { normalizedEmail, ...passwordUpdate },
                $unset: { emailConflict: '', password: '' },
            }
        )
    }

    await collection.createIndex(
        { normalizedEmail: 1 },
        {
            unique: true,
            name: 'users_normalized_email_unique',
            partialFilterExpression: { normalizedEmail: { $type: 'string' } },
        }
    )
}
