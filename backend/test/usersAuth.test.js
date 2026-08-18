import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import test from 'node:test'

import { createUsersController } from '../controllers/usersController.js'
import {
    createJwtToken,
    hashPassword,
    normalizeEmail,
    toPublicUser,
    verifyPassword,
} from '../utils/usersAuth.js'

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(statusCode) {
        this.statusCode = statusCode
        return this
    },
    json(body) {
        this.body = body
        return this
    },
})

const { loginUser, registerUser } = createUsersController()

test('registerUser returns 400 when required fields are missing', async () => {
    const response = createResponse()

    await registerUser({ body: { email: 'user@example.com' } }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, {
        message: 'Name, email, and password are required',
    })
})

test('loginUser returns 400 when required fields are missing', async () => {
    const response = createResponse()

    await loginUser({ body: { email: 'user@example.com' } }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, {
        message: 'Email and password are required',
    })
})

test('registerUser allowlists input and returns 201 with a public user', async () => {
    let receivedUserData
    const publicUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
    }
    const controller = createUsersController({
        createUser: async (userData) => {
            receivedUserData = userData
            return publicUser
        },
    })
    const response = createResponse()

    await controller.registerUser({
        body: {
            name: ' Test User ',
            email: ' TEST@EXAMPLE.COM ',
            password: 'password',
            createdAt: '2026-01-01T00:00:00.000Z',
            role: 'admin',
        },
    }, response)

    assert.equal(response.statusCode, 201)
    assert.deepEqual(response.body, publicUser)
    assert.deepEqual(Object.keys(receivedUserData), ['name', 'email', 'password', 'createdAt'])
    assert.equal(receivedUserData.name, 'Test User')
    assert.equal(receivedUserData.email, 'test@example.com')
    assert.equal(receivedUserData.createdAt instanceof Date, true)
})

test('registerUser returns 409 for a duplicate normalized email', async () => {
    const controller = createUsersController({
        createUser: async () => {
            const error = new Error('duplicate key')
            error.code = 11000
            throw error
        },
    })
    const response = createResponse()
    const originalConsoleError = console.error
    console.error = () => {}

    try {
        await controller.registerUser({
            body: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
            },
        }, response)
    } finally {
        console.error = originalConsoleError
    }

    assert.equal(response.statusCode, 409)
    assert.deepEqual(response.body, {
        message: 'A user with this email already exists',
    })
})

test('loginUser returns 401 when credentials do not match', async () => {
    const controller = createUsersController({
        authenticateUser: async () => null,
    })
    const response = createResponse()

    await controller.loginUser({
        body: { email: 'test@example.com', password: 'wrong-password' },
    }, response)

    assert.equal(response.statusCode, 401)
    assert.deepEqual(response.body, { message: 'Invalid email or password' })
})

test('loginUser returns the public user and JWT on success', async () => {
    const publicUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
    }
    let receivedCredentials
    const controller = createUsersController({
        authenticateUser: async (credentials) => {
            receivedCredentials = credentials
            return publicUser
        },
        createToken: () => 'signed-token',
    })
    const response = createResponse()

    await controller.loginUser({
        body: { email: ' TEST@EXAMPLE.COM ', password: 'password' },
    }, response)

    assert.equal(response.statusCode, 200)
    assert.deepEqual(receivedCredentials, {
        email: 'test@example.com',
        password: 'password',
    })
    assert.deepEqual(response.body, {
        user: publicUser,
        token: 'signed-token',
    })
})

test('getCurrentUser returns the authenticated public user', async () => {
    const publicUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
    }
    let receivedUserId
    const controller = createUsersController({
        findUserById: async (userId) => {
            receivedUserId = userId
            return publicUser
        },
    })
    const response = createResponse()

    await controller.getCurrentUser({
        user: { sub: 'authenticated-user-id' },
        body: { userId: 'body-user-id' },
        params: { id: 'params-user-id' },
        query: { userId: 'query-user-id' },
    }, response)

    assert.equal(receivedUserId, 'authenticated-user-id')
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.body, publicUser)
})

test('getCurrentUser returns 404 when the authenticated user does not exist', async () => {
    const controller = createUsersController({
        findUserById: async () => null,
    })
    const response = createResponse()

    await controller.getCurrentUser({ user: { sub: 'deleted-user-id' } }, response)

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.body, { message: 'User not found' })
})

test('getCurrentUser returns 500 without exposing model errors', async () => {
    const controller = createUsersController({
        findUserById: async () => {
            throw new Error('private database error')
        },
    })
    const response = createResponse()
    const originalConsoleError = console.error
    console.error = () => {}

    try {
        await controller.getCurrentUser({ user: { sub: 'user-id' } }, response)
    } finally {
        console.error = originalConsoleError
    }

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.body, { message: 'Failed to get user' })
})

test('updateCurrentUser allowlists and normalizes profile fields', async () => {
    let receivedUserId
    let receivedUserData
    const publicUser = {
        id: 'user-id',
        name: 'Updated User',
        email: 'updated@example.com',
    }
    const controller = createUsersController({
        updateUser: async (userId, userData) => {
            receivedUserId = userId
            receivedUserData = userData
            return publicUser
        },
    })
    const response = createResponse()

    await controller.updateCurrentUser({
        user: { sub: 'authenticated-user-id' },
        body: {
            name: ' Updated User ',
            email: ' UPDATED@EXAMPLE.COM ',
            role: 'admin',
            passwordHash: 'not-allowed',
        },
    }, response)

    assert.equal(receivedUserId, 'authenticated-user-id')
    assert.deepEqual(receivedUserData, {
        name: 'Updated User',
        email: 'updated@example.com',
    })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(response.body, publicUser)
})

test('updateCurrentUser rejects an empty or invalid update', async () => {
    const controller = createUsersController({
        updateUser: async () => {
            throw new Error('model should not be called')
        },
    })
    const response = createResponse()

    await controller.updateCurrentUser({
        user: { sub: 'user-id' },
        body: { email: 'invalid-email', role: 'admin' },
    }, response)

    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, { message: 'Provide a valid name or email' })
})

test('updateCurrentUser returns 404 when the authenticated user does not exist', async () => {
    const controller = createUsersController({ updateUser: async () => null })
    const response = createResponse()

    await controller.updateCurrentUser({
        user: { sub: 'deleted-user-id' },
        body: { name: 'Updated User' },
    }, response)

    assert.equal(response.statusCode, 404)
    assert.deepEqual(response.body, { message: 'User not found' })
})

test('updateCurrentUser returns 409 for a duplicate normalized email', async () => {
    const controller = createUsersController({
        updateUser: async () => {
            const error = new Error('duplicate key')
            error.code = 11000
            throw error
        },
    })
    const response = createResponse()
    const originalConsoleError = console.error
    console.error = () => {}

    try {
        await controller.updateCurrentUser({
            user: { sub: 'user-id' },
            body: { email: 'taken@example.com' },
        }, response)
    } finally {
        console.error = originalConsoleError
    }

    assert.equal(response.statusCode, 409)
    assert.deepEqual(response.body, {
        message: 'A user with this email already exists',
    })
})

test('updateCurrentUser returns 500 without exposing model errors', async () => {
    const controller = createUsersController({
        updateUser: async () => {
            throw new Error('private database error')
        },
    })
    const response = createResponse()
    const originalConsoleError = console.error
    console.error = () => {}

    try {
        await controller.updateCurrentUser({
            user: { sub: 'user-id' },
            body: { name: 'Updated User' },
        }, response)
    } finally {
        console.error = originalConsoleError
    }

    assert.equal(response.statusCode, 500)
    assert.deepEqual(response.body, { message: 'Failed to update user' })
})

test('normalizeEmail trims and lowercases email', () => {
    assert.equal(normalizeEmail('  User@Example.COM '), 'user@example.com')
})

test('hashPassword creates salted hashes and verifyPassword checks them', async () => {
    const firstHash = await hashPassword('password123')
    const secondHash = await hashPassword('password123')

    assert.notEqual(firstHash, 'password123')
    assert.notEqual(firstHash, secondHash)
    assert.equal(await verifyPassword('password123', firstHash), true)
    assert.equal(await verifyPassword('wrong-password', firstHash), false)
})

test('toPublicUser omits password and internal fields', () => {
    const user = toPublicUser({
        _id: { toString: () => 'user-id' },
        name: 'User',
        normalizedEmail: 'user@example.com',
        passwordHash: 'private',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    })

    assert.deepEqual(Object.keys(user), ['id', 'name', 'email', 'role', 'createdAt'])
    assert.equal(user.role, 'user')
    assert.equal(user.passwordHash, undefined)
    assert.equal(user.updatedAt, undefined)
})

test('createJwtToken creates a signed one-hour HS256 token', () => {
    process.env.JWT_SECRET = 'test-secret'
    const token = createJwtToken({ id: 'user-id', email: 'user@example.com' })
    const [header, payload, signature] = token.split('.')
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString())
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString())
    const expectedSignature = createHmac('sha256', process.env.JWT_SECRET)
        .update(`${header}.${payload}`)
        .digest('base64url')

    assert.deepEqual(decodedHeader, { alg: 'HS256', typ: 'JWT' })
    assert.equal(decodedPayload.sub, 'user-id')
    assert.equal(decodedPayload.email, 'user@example.com')
    assert.equal(decodedPayload.role, 'user')
    assert.equal(decodedPayload.exp - decodedPayload.iat, 3600)
    assert.equal(signature, expectedSignature)
})
