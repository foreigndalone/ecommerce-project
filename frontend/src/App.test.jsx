import { waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { renderWithProviders } from './test/renderWithProviders'

describe('App session bootstrap', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('restores the current user exactly once when a token is available', async () => {
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
        const { store } = renderWithProviders(<App />, {
            route: '/auth?mode=login',
            preloadedState: {
                usersReducer: {
                    currentUser: null,
                    token: 'signed-token',
                    sessionStatus: 'idle',
                    isLoading: false,
                    hasError: false,
                    errorMessage: null,
                },
            },
        })

        await waitFor(() => {
            expect(store.getState().usersReducer.currentUser).toEqual(currentUser)
        })

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock.mock.calls[0][0]).toContain('/api/users/me')
    })
})
