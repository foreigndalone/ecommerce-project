// path: src/features/users/usersSlice.js
import {
    createAsyncThunk,
    createListenerMiddleware,
    createSlice,
} from '@reduxjs/toolkit'

const USERS_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const USERS_API_URL = `${USERS_API_ORIGIN}/api/users/signUp`
const LOGIN_API_URL = `${USERS_API_ORIGIN}/api/users/login`
const CURRENT_USER_API_URL = `${USERS_API_ORIGIN}/api/users/me`
const AUTH_TOKEN_STORAGE_KEY = 'ecommerce.auth.token'

export const loadAuthToken = () => {
    if (typeof window === 'undefined') return null

    try {
        return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    } catch {
        return null
    }
}

export const saveAuthToken = (token) => {
    if (typeof window === 'undefined' || typeof token !== 'string' || !token) return

    try {
        window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
    } catch {
        // Keep the in-memory session working when storage is unavailable.
    }
}

export const removeAuthToken = () => {
    if (typeof window === 'undefined') return

    try {
        window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    } catch {
        // The Redux session can still be cleared when storage is unavailable.
    }
}

const getErrorMessage = async (response, fallbackMessage) => {
    const errorData = await response.json().catch(() => null)
    return errorData?.message || `${fallbackMessage}: ${response.status}`
}

export const sendUserData = createAsyncThunk(
    'users/sendUserData',
    async ({ name, email, password, createdAt } = {}, { rejectWithValue }) => {
        try {
            const trimmedName = typeof name === 'string' ? name.trim() : ''
            const trimmedEmail = typeof email === 'string' ? email.trim() : ''

            if (!trimmedName || !trimmedEmail || typeof password !== 'string' || !password) {
                return rejectWithValue('Name, email, and password are required')
            }

            const parsedCreatedAt = new Date(createdAt)
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

            return response.json()
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to register user')
        }
    }
)

export const login = createAsyncThunk(
    'users/signIn',
    async ({ email, password } = {}, { rejectWithValue }) => {
        try {
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

            return response.json()
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to log in')
        }
    }
)

export const fetchCurrentUser = createAsyncThunk(
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

            return response.json()
        } catch (error) {
            return rejectWithValue({
                status: null,
                message: error.message || 'Failed to get current user',
            })
        }
    }
)

const storedToken = loadAuthToken()

const initialState = {
    currentUser: null, //{ id, email, name, role, avatar }
    token: storedToken,
    sessionStatus: storedToken ? 'idle' : 'unauthenticated',

    isLoading: false,
    hasError: false,
    errorMessage: null
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

const selectUsersState = (state) => state.usersReducer

export const selectCurrentUser = (state) => selectUsersState(state).currentUser
export const selectAuthToken = (state) => selectUsersState(state).token
export const selectSessionStatus = (state) => selectUsersState(state).sessionStatus
export const selectIsSessionLoading = (state) =>
    selectSessionStatus(state) === 'loading'
export const selectIsAuthenticated = (state) => Boolean(
    selectUsersState(state).currentUser && selectUsersState(state).token
)

export default usersSlice.reducer
