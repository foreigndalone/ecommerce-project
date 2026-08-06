import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const USERS_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const USERS_API_URL = `${USERS_API_ORIGIN}/api/users/signUp`
const LOGIN_API_URL = `${USERS_API_ORIGIN}/api/users/login`

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

const initialState = {
    currentUser: null, //{ id, email, name, role, avatar }
    token: null,

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
                state.isLoading = false
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to log in'
            })
    },
})

export const { clearAuthError, logout } = usersSlice.actions

const selectUsersState = (state) => state.usersReducer

export const selectCurrentUser = (state) => selectUsersState(state).currentUser
export const selectIsAuthenticated = (state) => Boolean(
    selectUsersState(state).currentUser && selectUsersState(state).token
)

export default usersSlice.reducer
