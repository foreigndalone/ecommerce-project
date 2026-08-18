// path: src/features/adminProducts/adminProductsSlice.ts
import {
    createAsyncThunk,
    createSelector,
    createSlice,
} from '@reduxjs/toolkit'

import type { Product, ProductStatus } from '../../types/products'
import type { UsersState } from '../../types/users'

export interface AdminProductPayload {
    slug?: string
    sku?: string
    title: string
    description: string
    category: string
    brand?: string
    tags: string[]
    price: number
    discountPercentage?: number
    stock?: number
    minimumOrderQuantity?: number
    rating?: number
    images: string[]
    thumbnail?: string
    shippingInformation?: string
    warrantyInformation?: string
    returnPolicy?: string
    status?: ProductStatus
}

interface UpdateAdminProductArgs {
    productId: string
    updates: Partial<AdminProductPayload>
}

interface ArchiveAdminProductArgs {
    productId: string
}

interface AdminProductsState {
    isCreating: boolean
    isUpdatingById: Record<string, boolean>
    isArchivingById: Record<string, boolean>
    hasError: boolean
    errorMessage: string | null
    lastSavedProductId: string | null
}

interface AdminProductsRootState {
    adminProductsReducer: AdminProductsState
}

interface AdminProductsThunkState {
    usersReducer: UsersState
}

const initialState: AdminProductsState = {
    isCreating: false,
    isUpdatingById: {},
    isArchivingById: {},
    hasError: false,
    errorMessage: null,
    lastSavedProductId: null,
}

const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const REQUEST_TIMEOUT_MS = 8000

const trimString = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined

    const trimmedValue = value.trim()

    return trimmedValue || undefined
}

const normalizeStringArray = (value: unknown): string[] => (
    Array.isArray(value)
        ? value
            .map(item => trimString(item))
            .filter((item): item is string => Boolean(item))
        : []
)

const normalizeNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === '') return undefined

    const numberValue = Number(value)

    return Number.isFinite(numberValue) ? numberValue : undefined
}

const getErrorMessage = async (
    response: Response,
    fallbackMessage: string
): Promise<string> => {
    const errorData = await response.json().catch(() => ({
        message: response.statusText,
    }))

    return typeof errorData?.message === 'string'
        ? errorData.message
        : fallbackMessage
}

const getUnknownErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage

const getAuthToken = (getState: () => AdminProductsThunkState) =>
    getState().usersReducer.token

const getHeaders = (token: string, hasBody = false): HeadersInit => ({
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
})

const getRequestError = (error: unknown, fallbackMessage: string) => {
    if (error instanceof DOMException && error.name === 'AbortError') {
        return 'Admin products request timed out'
    }

    return getUnknownErrorMessage(error, fallbackMessage)
}

const cleanAdminProductPayload = (
    payload: Partial<AdminProductPayload>
): Partial<AdminProductPayload> => {
    const data: Partial<AdminProductPayload> = {}

    const stringFields = [
        'slug',
        'sku',
        'title',
        'description',
        'category',
        'brand',
        'thumbnail',
        'shippingInformation',
        'warrantyInformation',
        'returnPolicy',
    ] as const

    for (const field of stringFields) {
        if (field in payload) {
            const value = trimString(payload[field])

            if (value) data[field] = value
        }
    }

    if ('tags' in payload) {
        data.tags = normalizeStringArray(payload.tags)
    }

    if ('images' in payload) {
        data.images = normalizeStringArray(payload.images)
    }

    const numberFields = [
        'price',
        'discountPercentage',
        'stock',
        'minimumOrderQuantity',
        'rating',
    ] as const

    for (const field of numberFields) {
        if (field in payload) {
            const value = normalizeNumber(payload[field])

            if (value !== undefined) data[field] = value
        }
    }

    if ('status' in payload && payload.status) {
        data.status = payload.status
    }

    return data
}

export const createAdminProductThunk = createAsyncThunk<
    Product,
    AdminProductPayload,
    {
        state: AdminProductsThunkState
        rejectValue: string
    }
>(
    'adminProducts/createProduct',
    async (payload, { getState, rejectWithValue }) => {
        const token = getAuthToken(getState)

        if (!token) return rejectWithValue('Authentication token is missing')

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
            const response = await fetch(`${API_URL}/admin/products`, {
                method: 'POST',
                headers: getHeaders(token, true),
                body: JSON.stringify(cleanAdminProductPayload(payload)),
                signal: controller.signal,
            })

            if (!response.ok) {
                return rejectWithValue(
                    await getErrorMessage(response, 'Failed to create product')
                )
            }

            return response.json() as Promise<Product>
        } catch (error) {
            return rejectWithValue(
                getRequestError(error, 'Failed to create product')
            )
        } finally {
            clearTimeout(timeoutId)
        }
    }
)

export const updateAdminProductThunk = createAsyncThunk<
    Product,
    UpdateAdminProductArgs,
    {
        state: AdminProductsThunkState
        rejectValue: string
    }
>(
    'adminProducts/updateProduct',
    async ({ productId, updates }, { getState, rejectWithValue }) => {
        const token = getAuthToken(getState)

        if (!token) return rejectWithValue('Authentication token is missing')

        const cleanedUpdates = cleanAdminProductPayload(updates)

        if (!Object.keys(cleanedUpdates).length) {
            return rejectWithValue('Product update is empty')
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
            const response = await fetch(
                `${API_URL}/admin/products/${encodeURIComponent(productId)}`,
                {
                    method: 'PATCH',
                    headers: getHeaders(token, true),
                    body: JSON.stringify(cleanedUpdates),
                    signal: controller.signal,
                }
            )

            if (!response.ok) {
                return rejectWithValue(
                    await getErrorMessage(response, 'Failed to update product')
                )
            }

            return response.json() as Promise<Product>
        } catch (error) {
            return rejectWithValue(
                getRequestError(error, 'Failed to update product')
            )
        } finally {
            clearTimeout(timeoutId)
        }
    }
)

export const archiveAdminProductThunk = createAsyncThunk<
    Product,
    ArchiveAdminProductArgs,
    {
        state: AdminProductsThunkState
        rejectValue: string
    }
>(
    'adminProducts/archiveProduct',
    async ({ productId }, { getState, rejectWithValue }) => {
        const token = getAuthToken(getState)

        if (!token) return rejectWithValue('Authentication token is missing')

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
            const response = await fetch(
                `${API_URL}/admin/products/${encodeURIComponent(productId)}`,
                {
                    method: 'DELETE',
                    headers: getHeaders(token),
                    signal: controller.signal,
                }
            )

            if (!response.ok) {
                return rejectWithValue(
                    await getErrorMessage(response, 'Failed to archive product')
                )
            }

            return response.json() as Promise<Product>
        } catch (error) {
            return rejectWithValue(
                getRequestError(error, 'Failed to archive product')
            )
        } finally {
            clearTimeout(timeoutId)
        }
    }
)

const adminProductsSlice = createSlice({
    name: 'adminProducts',
    initialState,
    reducers: {
        clearAdminProductsError: (state) => {
            state.hasError = false
            state.errorMessage = null
        },
        clearLastSavedProductId: (state) => {
            state.lastSavedProductId = null
        },
    },
    extraReducers(builder) {
        builder
            .addCase(createAdminProductThunk.pending, (state) => {
                state.isCreating = true
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = null
            })
            .addCase(createAdminProductThunk.fulfilled, (state, action) => {
                state.isCreating = false
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = action.payload.id
            })
            .addCase(createAdminProductThunk.rejected, (state, action) => {
                state.isCreating = false
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to create product'
            })
            .addCase(updateAdminProductThunk.pending, (state, action) => {
                state.isUpdatingById[action.meta.arg.productId] = true
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = null
            })
            .addCase(updateAdminProductThunk.fulfilled, (state, action) => {
                delete state.isUpdatingById[action.meta.arg.productId]
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = action.payload.id
            })
            .addCase(updateAdminProductThunk.rejected, (state, action) => {
                delete state.isUpdatingById[action.meta.arg.productId]
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to update product'
            })
            .addCase(archiveAdminProductThunk.pending, (state, action) => {
                state.isArchivingById[action.meta.arg.productId] = true
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = null
            })
            .addCase(archiveAdminProductThunk.fulfilled, (state, action) => {
                delete state.isArchivingById[action.meta.arg.productId]
                state.hasError = false
                state.errorMessage = null
                state.lastSavedProductId = action.payload.id
            })
            .addCase(archiveAdminProductThunk.rejected, (state, action) => {
                delete state.isArchivingById[action.meta.arg.productId]
                state.hasError = true
                state.errorMessage = action.payload || action.error.message || 'Failed to archive product'
            })
    },
})

export const {
    clearAdminProductsError,
    clearLastSavedProductId,
} = adminProductsSlice.actions

const selectAdminProductsState = (state: AdminProductsRootState) => state.adminProductsReducer

export const selectIsCreatingAdminProduct = createSelector(
    selectAdminProductsState,
    adminProductsState => adminProductsState.isCreating
)

export const selectIsUpdatingAdminProductById = createSelector(
    [selectAdminProductsState, (_: AdminProductsRootState, productId: string) => productId],
    (adminProductsState, productId) => Boolean(adminProductsState.isUpdatingById[productId])
)

export const selectIsArchivingAdminProductById = createSelector(
    [selectAdminProductsState, (_: AdminProductsRootState, productId: string) => productId],
    (adminProductsState, productId) => Boolean(adminProductsState.isArchivingById[productId])
)

export const selectHasAdminProductsError = createSelector(
    selectAdminProductsState,
    adminProductsState => adminProductsState.hasError
)

export const selectAdminProductsErrorMessage = createSelector(
    selectAdminProductsState,
    adminProductsState => adminProductsState.errorMessage
)

export const selectLastSavedProductId = createSelector(
    selectAdminProductsState,
    adminProductsState => adminProductsState.lastSavedProductId
)

export default adminProductsSlice.reducer
