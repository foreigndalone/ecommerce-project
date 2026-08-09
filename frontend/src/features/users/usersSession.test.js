import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createTestStore } from '../../test/renderWithProviders'
import {
    fetchCurrentUser,
    login,
    logout,
} from './usersSlice'

const AUTH_TOKEN_STORAGE_KEY = 'ecommerce.auth.token'

const createLocalStorageMock = () => {
    const values = new Map()

    return {
        clear: () => values.clear(),
        getItem: (key) => values.get(key) ?? null,
        removeItem: (key) => values.delete(key),
        setItem: (key, value) => values.set(key, String(value)),
    }
}

const createUsersState = (overrides = {}) => ({
    currentUser: null,
    token: null,
    sessionStatus: 'unauthenticated',
    isLoading: false,
    hasError: false,
    errorMessage: null,
    ...overrides,
})

describe('users session restoration', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: createLocalStorageMock(),
        })
    })

    afterEach(() => {
        window.localStorage.clear()
        vi.unstubAllGlobals()
    })

    it('sends the stored Redux token as a Bearer token and stores the user', async () => {
        const currentUser = {
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
        }
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => currentUser,
        })
        vi.stubGlobal('fetch', fetchMock)
        const store = createTestStore({
            usersReducer: createUsersState({
                token: 'signed-token',
                sessionStatus: 'idle',
            }),
        })

        await store.dispatch(fetchCurrentUser())

        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('/api/users/me'),
            {
                method: 'GET',
                headers: {
                    Authorization: 'Bearer signed-token',
                },
            }
        )
        expect(store.getState().usersReducer.currentUser).toEqual(currentUser)
        expect(store.getState().usersReducer.sessionStatus).toBe('authenticated')
    })

    it('does not make a request without a token', async () => {
        const fetchMock = vi.fn()
        vi.stubGlobal('fetch', fetchMock)
        const store = createTestStore({
            usersReducer: createUsersState(),
        })

        await store.dispatch(fetchCurrentUser())

        expect(fetchMock).not.toHaveBeenCalled()
        expect(store.getState().usersReducer.sessionStatus).toBe('unauthenticated')
    })

    it('clears Redux and persisted authentication after a 401 response', async () => {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'expired-token')
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            json: async () => ({ message: 'Invalid or expired authorization token' }),
        }))
        const store = createTestStore({
            usersReducer: createUsersState({
                token: 'expired-token',
                sessionStatus: 'idle',
            }),
        })

        await store.dispatch(fetchCurrentUser())

        expect(store.getState().usersReducer.currentUser).toBeNull()
        expect(store.getState().usersReducer.token).toBeNull()
        expect(store.getState().usersReducer.sessionStatus).toBe('unauthenticated')
        expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
    })

    it('keeps the persisted token after a server error', async () => {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'signed-token')
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ message: 'Failed to get user' }),
        }))
        const store = createTestStore({
            usersReducer: createUsersState({
                token: 'signed-token',
                sessionStatus: 'idle',
            }),
        })

        await store.dispatch(fetchCurrentUser())

        expect(store.getState().usersReducer.token).toBe('signed-token')
        expect(store.getState().usersReducer.sessionStatus).toBe('failed')
        expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('signed-token')
    })

    it('persists a successful login token and removes it on logout', async () => {
        const store = createTestStore({
            usersReducer: createUsersState(),
        })
        const payload = {
            user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
            token: 'signed-token',
        }

        store.dispatch(login.fulfilled(payload, 'login-request', {}))

        expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBe('signed-token')

        store.dispatch(logout())

        expect(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)).toBeNull()
        expect(store.getState().usersReducer.sessionStatus).toBe('unauthenticated')
    })
})
