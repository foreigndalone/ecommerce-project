import { createAsyncThunk, createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'

const productsAdapter = createEntityAdapter({
    sortComparer: (a, b) => a.title.localeCompare(b.title),
})

const PRODUCTS_API_URL = 'https://dummyjson.com/products'

export const fetchProductsThunk = createAsyncThunk(
    '/products/fetch',
    async () => {
        const result = await fetch(PRODUCTS_API_URL)
        if (!result.ok) throw new Error(`Request failed: ${result.status}`)
        const data = await result.json()
        return data.products
    },
    {
        condition: (_, { getState }) => {
            const productsState = getState().productsReducer
            return productsState.ids.length === 0 && !productsState.isLoading
        },
    }
)

export const fetchProductByIdThunk = createAsyncThunk(
    '/products/fetchById',
    async (productId) => {
        const result = await fetch(`${PRODUCTS_API_URL}/${productId}`)
        if (!result.ok) throw new Error(`Request failed: ${result.status}`)
        return result.json()
    },
    {
        condition: (productId, { getState }) => {
            const productsState = getState().productsReducer
            return !productsState.entities[productId] && !productsState.loadingById[productId]
        },
    }
)

const initialState = productsAdapter.getInitialState({
    searchQuery: '',
    selectedCategory: '',
    selectedBrand: '',
    isLoading: false,
    hasError: false,
    errorMessage: null,
    loadingById: {},
})

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload
        },
        setSelectedBrand: (state, action) => {
            state.selectedBrand = action.payload
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchProductsThunk.rejected, (state, action) => {
                state.hasError = true
                state.errorMessage = action.error.message || 'Failed to fetch products'
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
                productsAdapter.setAll(state, action.payload)
            })
            .addCase(fetchProductByIdThunk.rejected, (state, action) => {
                const productId = action.meta.arg
                delete state.loadingById[productId]
                state.hasError = true
                state.errorMessage = action.error.message || 'Failed to fetch product'
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

const selectProductsState = state => state.productsReducer

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
    [selectProductsState, (_, productId) => productId],
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
            const tags = Array.isArray(product?.tags)
                ? product.tags.join(' ').toLowerCase()
                : product?.tags?.toLowerCase() || ''

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

export const {
    setSearchQuery,
    setSelectedCategory,
    setSelectedBrand,
} = productsSlice.actions

export default productsSlice.reducer
