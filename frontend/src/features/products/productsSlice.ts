// path: src/features/products/productsSlice.ts
import {
    createAsyncThunk,
    createEntityAdapter,

    createSelector,
    createSlice,
    
    type EntityState,
    type PayloadAction,
} from '@reduxjs/toolkit'

import type {
    Product,
    ProductsError,
    ProductsErrorType,
    ProductsQuery,
    ProductsResponse,
} from '../../types/products'

interface ProductsStateExtra {
    searchQuery: string
    selectedCategory: string
    selectedBrand: string
    isLoading: boolean
    hasError: boolean
    errorMessage: string | null
    loadingById: Record<string, boolean>
    hasLoadedList: boolean
}

type ProductsState = EntityState<Product, string> & ProductsStateExtra

interface ProductsRootState {
    productsReducer: ProductsState
}

const productsAdapter = createEntityAdapter<Product>({
    sortComparer: (a, b) => a.title.localeCompare(b.title),
})

const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const REQUEST_TIMEOUT_MS = 8000

const trimString = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : ''

const createProductsError = ({
    type,
    message,
    status,
}: {
    type: ProductsErrorType
    message: string
    status?: number
}): ProductsError => ({
    type,
    message,
    status,
})

const getResponseError = async (
    response: Response,
    fallbackMessage: string
): Promise<ProductsError> => {
    const errorData = await response.json().catch(() => null)

    return createProductsError({
        type: 'server',
        message: typeof errorData?.message === 'string'
            ? errorData.message
            : response.statusText || fallbackMessage,
        status: response.status,
    })
}

const getUnknownErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage

export const fetchProductsThunk = createAsyncThunk<
    ProductsResponse,
    ProductsQuery | undefined,
    {
        state: ProductsRootState
        rejectValue: ProductsError
    }
>(
    '/products/fetch',
    async ({
        search = '',
        category = '',
        brand = '',
        limit = 30,
        skip = 0,
    } = {}, { rejectWithValue }) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
        const params = new URLSearchParams()

        const trimmedSearch = trimString(search)
        const trimmedCategory = trimString(category)
        const trimmedBrand = trimString(brand)

        if (trimmedSearch) params.set('search', trimmedSearch)
        if (trimmedCategory) params.set('category', trimmedCategory)
        if (trimmedBrand) params.set('brand', trimmedBrand)
            
        params.set('limit', String(limit))
        params.set('skip', String(skip))

        try {
            const queryString = params.toString()
            const response = await fetch(
                `${API_URL}/products${queryString ? `?${queryString}` : ''}`,
                { signal: controller.signal }
            )

            if (!response.ok) {
                return rejectWithValue(
                    await getResponseError(response, 'Failed to fetch products')
                )
            }

            return response.json()
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return rejectWithValue(createProductsError({
                    type: 'timeout',
                    message: 'Products request timed out',
                }))
            }

            return rejectWithValue(createProductsError({
                type: 'network',
                message: getUnknownErrorMessage(error, 'Failed to fetch products'),
            }))
        } finally {
            clearTimeout(timeoutId)
        }
    },
    {
        condition: (args = {}, { getState }) => {
            const productsState = getState().productsReducer
            const hasQueryArgs = Boolean(
                trimString(args.search)
                || trimString(args.category)
                || trimString(args.brand)
                || args.limit !== undefined
                || args.skip !== undefined
            )

            return hasQueryArgs || (!productsState.hasLoadedList && !productsState.isLoading)
        },
    }
)

export const fetchProductByIdThunk = createAsyncThunk<
    Product,
    string,
    {
        state: ProductsRootState
        rejectValue: ProductsError
    }
>(
    '/products/fetchById',
    async (productId, { rejectWithValue }) => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
            const response = await fetch(
                `${API_URL}/products/${encodeURIComponent(productId)}`,
                { signal: controller.signal }
            )

            if (!response.ok) {
                return rejectWithValue(
                    await getResponseError(response, 'Failed to fetch product')
                )
            }

            return response.json()
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return rejectWithValue(createProductsError({
                    type: 'timeout',
                    message: 'Product request timed out',
                }))
            }

            return rejectWithValue(createProductsError({
                type: 'network',
                message: getUnknownErrorMessage(error, 'Failed to fetch product'),
            }))
        } finally {
            clearTimeout(timeoutId)
        }
    },
    {
        condition: (productId, { getState }) => {
            const productsState = getState().productsReducer
            return !productsState.entities[productId] && !productsState.loadingById[productId]
        },
    }
)

const initialState: ProductsState = productsAdapter.getInitialState({
    searchQuery: '',
    selectedCategory: '',
    selectedBrand: '',

    isLoading: false,
    hasError: false,
    errorMessage: null,

    loadingById: {},
    hasLoadedList: false,
})

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload
        },
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload
        },
        setSelectedBrand: (state, action: PayloadAction<string>) => {
            state.selectedBrand = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchProductsThunk.rejected, (state, action) => {
                state.hasError = true
                state.errorMessage = action.payload?.message || action.error.message || 'Failed to fetch products'
                state.isLoading = false
            })
            .addCase(fetchProductsThunk.pending, (state) => {
                state.isLoading = true
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(fetchProductsThunk.fulfilled, (state, action) => {
                state.isLoading = false
                state.hasError = false
                state.errorMessage = null
                state.hasLoadedList = true
                productsAdapter.setAll(state, action.payload.products)
            })
            .addCase(fetchProductByIdThunk.rejected, (state, action) => {
                const productId = action.meta.arg
                delete state.loadingById[productId]
                state.hasError = true
                state.errorMessage = action.payload?.message || action.error.message || 'Failed to fetch product'
            })
            .addCase(fetchProductByIdThunk.pending, (state, action) => {
                state.loadingById[action.meta.arg] = true
                state.hasError = false
                state.errorMessage = null
            })
            .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
                delete state.loadingById[action.payload.id]
                state.hasError = false
                state.errorMessage = null
                productsAdapter.upsertOne(state, action.payload)
            })
    },
})

export const {
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
} = productsSlice.actions





const selectProductsState = (state: ProductsRootState) => state.productsReducer

export const {
    selectAll: selectProducts,
    selectById: selectProductById,
    selectEntities: selectProductEntities,
} = productsAdapter.getSelectors(selectProductsState)

export const selectSearchQuery = createSelector(
    selectProductsState,
    productsState => productsState.searchQuery
)

export const selectSelectedCategory = createSelector(
    selectProductsState,
    productsState => productsState.selectedCategory
)

export const selectSelectedBrand = createSelector(
    selectProductsState,
    productsState => productsState.selectedBrand
)

export const selectIsLoadingProducts = createSelector(
    selectProductsState,
    productsState => productsState.isLoading
)

export const selectHasProductsError = createSelector(
    selectProductsState,
    productsState => productsState.hasError
)

export const selectProductsErrorMessage = createSelector(
    selectProductsState,
    productsState => productsState.errorMessage
)

export const selectIsProductLoadingById = createSelector(
    [selectProductsState, (_: ProductsRootState, productId: string) => productId],
    (productsState, productId) => Boolean(productsState.loadingById[productId])
)

export const selectCategories = createSelector(
    selectProducts,
    products => [...new Set(products
        .map(product => product?.category)
        .filter(Boolean))]
        .sort()
)

export const selectBrands = createSelector(
    selectProducts,
    products => [...new Set(products
        .map(product => product?.brand)
        .filter(Boolean))]
        .sort()
)

export const selectFilteredProducts = createSelector(
    [selectProducts, selectProductsState],
    (products, productsState) => {
        const query = productsState.searchQuery.trim().toLowerCase()
        const selectedCategory = productsState.selectedCategory
        const selectedBrand = productsState.selectedBrand

        if (!query && !selectedCategory && !selectedBrand) {
            return products
        }

        return products.filter(product => {
            const title = product?.title?.toLowerCase() || ''
            const category = product?.category?.toLowerCase() || ''
            const brand = product?.brand?.toLowerCase() || ''
            const tags = product.tags.join(' ').toLowerCase()

            const matchesSearch = !query
                || title.includes(query)
                || category.includes(query)
                || brand.includes(query)
                || tags.includes(query)
            const matchesCategory = !selectedCategory || product?.category === selectedCategory
            const matchesBrand = !selectedBrand || product?.brand === selectedBrand

            return matchesSearch && matchesCategory && matchesBrand
        })
    }
)

export default productsSlice.reducer
