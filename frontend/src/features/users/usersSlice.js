import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const USERS_API_URL = `http://localhost:3000/api/users`

export const sendUserData = createAsyncThunk(
    'users/sendUserData',
    async ({ name, email, password, createdAt } = {}) => {
        const trimmedName = typeof name === 'string' ? name.trim() : ''
        const trimmedEmail = typeof email === 'string' ? email.trim() : ''

        if (!trimmedName || !trimmedEmail || typeof password !== 'string' || !password) {
            throw new Error('Name, email, and password are required')
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
            throw new Error(`Request failed: ${response.status}`)
        }

        return response.json()
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
    reducers: {},
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
                state.errorMessage = action.error.message || 'Failed to register user'
            })
    },
})


export default usersSlice.reducer
