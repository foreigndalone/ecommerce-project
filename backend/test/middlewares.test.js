import assert from 'node:assert/strict'
import test from 'node:test'

import { createJwtToken } from '../utils/usersAuth.js'
import {
    requireAuth,
    verifyJwtToken,
} from '../src/middlewares/auth.middleware.js'
import { validateRequest } from '../src/middlewares/validate.middleware.js'
import { createUsersController } from '../controllers/usersController.js'

const createResponse = () => ({
    statusCode: null,
    body: null,
    status(code) {
        this.statusCode = code
        return this
    },
    json(body) {
        this.body = body
        return this
    },
})

test('verifyJwtToken verifies tokens created by the auth utility', () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'middleware-test-secret'

    try {
        const token = createJwtToken({ id: 'user-id', email: 'user@example.com' })
        const payload = verifyJwtToken(token)

        assert.equal(payload.sub, 'user-id')
        assert.equal(payload.email, 'user@example.com')
    } finally {
        process.env.JWT_SECRET = previousSecret
    }
})

test('requireAuth attaches the verified payload to the request', () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'middleware-test-secret'

    try {
        const token = createJwtToken({ id: 'user-id', email: 'user@example.com' })
        const req = { headers: { authorization: `Bearer ${token}` } }
        const res = createResponse()
        let nextCalled = false

        requireAuth(req, res, () => { nextCalled = true })

        assert.equal(nextCalled, true)
        assert.equal(req.user.sub, 'user-id')
        assert.equal(res.statusCode, null)
    } finally {
        process.env.JWT_SECRET = previousSecret
    }
})

test('requireAuth rejects a missing token', () => {
    const req = { headers: {} }
    const res = createResponse()

    requireAuth(req, res, () => assert.fail('next should not be called'))

    assert.equal(res.statusCode, 401)
    assert.deepEqual(res.body, { message: 'Authorization token is required' })
})

test('requireAuth rejects an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } }
    const res = createResponse()

    requireAuth(req, res, () => assert.fail('next should not be called'))

    assert.equal(res.statusCode, 401)
    assert.deepEqual(res.body, {
        message: 'Invalid or expired authorization token',
    })
})

test('a valid JWT reaches getCurrentUser with the verified subject', async () => {
    const previousSecret = process.env.JWT_SECRET
    process.env.JWT_SECRET = 'middleware-test-secret'

    try {
        const token = createJwtToken({ id: 'user-id', email: 'user@example.com' })
        const req = { headers: { authorization: `Bearer ${token}` } }
        const res = createResponse()
        let receivedUserId
        const publicUser = {
            id: 'user-id',
            name: 'Test User',
            email: 'user@example.com',
        }
        const controller = createUsersController({
            findUserById: async (userId) => {
                receivedUserId = userId
                return publicUser
            },
        })

        await new Promise((resolve) => {
            requireAuth(req, res, async () => {
                await controller.getCurrentUser(req, res)
                resolve()
            })
        })

        assert.equal(receivedUserId, 'user-id')
        assert.equal(res.statusCode, 200)
        assert.deepEqual(res.body, publicUser)
    } finally {
        process.env.JWT_SECRET = previousSecret
    }
})

test('validateRequest replaces input with validated data', () => {
    const schema = {
        safeParse: () => ({ success: true, data: { email: 'user@example.com' } }),
    }
    const middleware = validateRequest(schema)
    const req = { body: { email: ' USER@EXAMPLE.COM ' } }
    const res = createResponse()
    let nextCalled = false

    middleware(req, res, () => { nextCalled = true })

    assert.equal(nextCalled, true)
    assert.deepEqual(req.body, { email: 'user@example.com' })
})

test('validateRequest returns validation errors', () => {
    const issues = [{ path: ['email'], message: 'Invalid email' }]
    const schema = {
        safeParse: () => ({ success: false, error: { issues } }),
    }
    const req = { body: {} }
    const res = createResponse()

    validateRequest(schema)(req, res, () => assert.fail('next should not be called'))

    assert.equal(res.statusCode, 400)
    assert.deepEqual(res.body, {
        message: 'Validation failed',
        errors: issues,
    })
})
