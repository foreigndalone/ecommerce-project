// path: src/features/users/usersSlice.ts
import {
    createAsyncThunk,
    createListenerMiddleware,
    createSlice,
} from '@reduxjs/toolkit'

import type {
    AuthErrorPayload,
    AuthResponse,
    LoginPayload,
    RegisterUserPayload,
    UpdateUserPayload,
    User,
    UsersState,
} from '../../types/users'

interface UsersRootState {
    usersReducer: UsersState
}

const USERS_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const USERS_API_URL = `${USERS_API_ORIGIN}/api/users/signUp`
const LOGIN_API_URL = `${USERS_API_ORIGIN}/api/users/login`
const CURRENT_USER_API_URL = `${USERS_API_ORIGIN}/api/users/me`
const AUTH_TOKEN_STORAGE_KEY = 'ecommerce.auth.token'

export const loadAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null

    try {
        return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

export const saveAuthToken = (token: string): void => {
    if (typeof window === 'undefined' || typeof token !== 'string' || !token) return

    try {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } catch {
        // Keep the in-memory session working when storage is unavailable.
    }
}

export const removeAuthToken = (): void => {
    if (typeof window === 'undefined') return

    try {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    } catch {
        // The Redux session can still be cleared when storage is unavailable.
    }
}

const getErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
    const errorData = await response.json().catch(() => null)
    return errorData?.message || `${fallbackMessage}: ${response.status}`
}

export const sendUserData = createAsyncThunk<User, RegisterUserPayload | undefined, { rejectValue: string }>(
    'users/sendUserData',
    async (payload, { rejectWithValue }) => {
        try {
            const { name, email, password, createdAt } = payload ?? {}
            const trimmedName = typeof name === 'string' ? name.trim() : ''
            const trimmedEmail = typeof email === 'string' ? email.trim() : ''

            if (!trimmedName || !trimmedEmail || typeof password !== 'string' || !password) {
                return rejectWithValue('Name, email, and password are required')
            }

            const parsedCreatedAt = createdAt ? new Date(createdAt) : new Date(Number.NaN)
            const normalizedCreatedAt = Number.isNaN(parsedCreatedAt.getTime())
                ? new Date().toISOString()
                : parsedCreatedAt.toISOString()

            const response = await fetch(USERS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    password,
                    createdAt: normalizedCreatedAt,
                }),
            })

            if (!response.ok) {
                return rejectWithValue(await getErrorMessage(response, 'Failed to register user'))
            }

            return response.json() as Promise<User>
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to register user')
        }
    }
)

export const login = createAsyncThunk<AuthResponse, LoginPayload | undefined, { rejectValue: string }>(
    'users/signIn',
    async (payload, { rejectWithValue }) => {
        try {
            const { email, password } = payload ?? {}
            const trimmedEmail = typeof email === 'string' ? email.trim() : ''

            if (!trimmedEmail || !password) {
                return rejectWithValue('Email and password are required')
            }

            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                }),
            })

            if (!response.ok) {
                return rejectWithValue(await getErrorMessage(response, 'Failed to log in'))
            }

            return response.json() as Promise<AuthResponse>
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to log in')
        }
    }
)

export const fetchCurrentUser = createAsyncThunk<User, void, { state: UsersRootState; rejectValue: AuthErrorPayload }>(
    'users/fetchCurrentUser',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().usersReducer.token

        if (!token) {
            return rejectWithValue({
                status: 401,
                message: 'Authentication token is missing',
            })
        }

        try {
            const response = await fetch(CURRENT_USER_API_URL, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                return rejectWithValue({
                    status: response.status,
                    message: await getErrorMessage(response, 'Failed to get current user'),
                })
            }

            return response.json() as Promise<User>
        } catch (error) {
            return rejectWithValue({
                status: null,
                message: error instanceof Error ? error.message : 'Failed to get current user',
            })
        }
    }
)

export const updateCurrentUser = createAsyncThunk<User, UpdateUserPayload | undefined, { state: UsersRootState; rejectValue: string }>(
    'users/updateCurrentUser',
    async ({ name, email } = {}, { getState, rejectWithValue }) => {
        const token = getState().usersReducer.token

        if (!token) {
            return rejectWithValue('Authentication token is missing')
        }

        try {
            const response = await fetch(CURRENT_USER_API_URL, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            })

            if (!response.ok) {
                return rejectWithValue(await getErrorMessage(response, 'Failed to update user'))
            }

            return response.json() as Promise<User>
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update user')
        }
    }
)

const storedToken = loadAuthToken()

const initialState: UsersState = {
    currentUser: null, //{ id, email, name, role, avatar }
    token: storedToken,
    sessionStatus: storedToken ? 'idle' : 'unauthenticated',

    isLoading: false,
    hasError: false,
    errorMessage: null,
    profileUpdateStatus: 'idle',
    profileUpdateError: null,
}

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        logout: (state) => {
            state.currentUser = null
            state.token = null
            state.sessionStatus = 'unauthenticated'
            state.hasError = false
            state.errorMessage = null
            state.profileUpdateStatus = 'idle'
            state.profileUpdateError = null
        },
        clearAuthError: (state) => {
            state.hasError = false
            state.errorMessage = null
        },
    },
    extraReducers(builder) {
        builder
            .addCase(sendUserData.pending, (state) => {
                state.isLoading = true
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(sendUserData.fulfilled, (state, action) => {
                state.currentUser = action.payload
                state.isLoading = false
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(sendUserData.rejected, (state, action) => {
                state.isLoading = false
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to register user'
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.currentUser = action.payload.user
                state.token = action.payload.token
                state.sessionStatus = 'authenticated'
                state.isLoading = false
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to log in'
            })
            .addCase(fetchCurrentUser.pending, (state) => {
                state.sessionStatus = 'loading'
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.currentUser = action.payload
                state.sessionStatus = 'authenticated'
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.currentUser = null

                if (action.payload?.status === 401) {
                    state.token = null
                    state.sessionStatus = 'unauthenticated'
                    state.hasError = false
                    state.errorMessage = null
                    return
                }

                state.sessionStatus = 'failed'
                state.hasError = true
                state.errorMessage = action.payload?.message
                    || action.error.message
                    || 'Failed to restore authentication'
            })
            .addCase(updateCurrentUser.pending, (state) => {
                state.profileUpdateStatus = 'loading'
                state.profileUpdateError = null
            })
            .addCase(updateCurrentUser.fulfilled, (state, action) => {
                state.currentUser = action.payload
                state.profileUpdateStatus = 'succeeded'
                state.profileUpdateError = null
            })
            .addCase(updateCurrentUser.rejected, (state, action) => {
                state.profileUpdateStatus = 'failed'
                state.profileUpdateError = action.payload
                    || action.error.message
                    || 'Failed to update user'
            })
    },
})

export const { clearAuthError, logout } = usersSlice.actions

export const createAuthListenerMiddleware = () => {
    const listenerMiddleware = createListenerMiddleware()

    listenerMiddleware.startListening({
        actionCreator: login.fulfilled,
        effect: (action) => {
            saveAuthToken(action.payload.token)
        },
    })

    listenerMiddleware.startListening({
        actionCreator: logout,
        effect: () => {
            removeAuthToken()
        },
    })

    listenerMiddleware.startListening({
        actionCreator: fetchCurrentUser.rejected,
        effect: (action) => {
            if (action.payload?.status === 401) {
                removeAuthToken()
            }
        },
    })

    return listenerMiddleware
}

const selectUsersState = (state: UsersRootState) => state.usersReducer

export const selectCurrentUser = (state: UsersRootState) => selectUsersState(state).currentUser
export const selectAuthToken = (state: UsersRootState) => selectUsersState(state).token
export const selectSessionStatus = (state: UsersRootState) => selectUsersState(state).sessionStatus
export const selectProfileUpdateStatus = (state: UsersRootState) =>
    selectUsersState(state).profileUpdateStatus ?? 'idle'
export const selectProfileUpdateError = (state: UsersRootState) =>
    selectUsersState(state).profileUpdateError
export const selectIsSessionLoading = (state: UsersRootState) =>
    selectSessionStatus(state) === 'loading'
export const selectIsAuthenticated = (state: UsersRootState) => Boolean(
    selectUsersState(state).currentUser && selectUsersState(state).token
)

export default usersSlice.reducer
