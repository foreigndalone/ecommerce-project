import { ObjectId } from 'mongodb'

import { getDb } from '../config/db.js'
import {
    hashPassword,
    normalizeEmail,
    toPublicUser,
    verifyPassword,
} from '../utils/usersAuth.js'

const COLLECTION_NAME = 'users'

const getCollection = () => getDb().collection(COLLECTION_NAME)

export const ensureUsersEmailIndex = async () => {
    await getCollection().createIndex(
        { normalizedEmail: 1 },
        {
            unique: true,
            name: 'users_normalized_email_unique',
            partialFilterExpression: { normalizedEmail: { $type: 'string' } },
        }
    )
}

export const createUserModel = async (userData) => {
    const collection = getCollection()
    const user = {
        name: userData.name,
        normalizedEmail: normalizeEmail(userData.email),
        role: 'user',
        passwordHash: await hashPassword(userData.password),
        createdAt: userData.createdAt ?? new Date(),
        updatedAt: new Date(),
    }
    const result = await collection.insertOne(user)

    return toPublicUser({ _id: result.insertedId, ...user })
}

export const authenticateUserModel = async ({ email, password }) => {
    const user = await getCollection().findOne({
        normalizedEmail: normalizeEmail(email),
    })

    if (!user || !await verifyPassword(password, user.passwordHash)) {
        return null
    }

    return toPublicUser(user)
}

export const findUserByIdModel = async (userId) => {
    if (!ObjectId.isValid(userId)) return null

    const user = await getCollection().findOne({
        _id: new ObjectId(userId),
    })

    return user ? toPublicUser(user) : null
}

export const updateUserModel = async (userId, userData) => {
    if (!ObjectId.isValid(userId)) return null

    const updates = { updatedAt: new Date() }

    if (userData.name !== undefined) {
        updates.name = userData.name
    }

    if (userData.email !== undefined) {
        updates.normalizedEmail = normalizeEmail(userData.email)
    }

    const user = await getCollection().findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: updates },
        { returnDocument: 'after' }
    )

    return user ? toPublicUser(user) : null
}
