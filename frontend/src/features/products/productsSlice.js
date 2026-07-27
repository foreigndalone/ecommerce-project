import {createSlice, createAsyncThunk, createSelector} from '@reduxjs/toolkit'

export const fetchProductsThunk = createAsyncThunk('/products/fetch', async()=>{
    const result = await fetch('https://dummyjson.com/products');
    if (!result.ok) throw new Error(`Ошибка: ${result.status}`);
    const data = await result.json();
    return data.products;
})


const initialState = {
    products: [],
    favProducts: [],
    searchQuery: '',
    hasError: false,
    errorMessage: null,
    isLoading: false,
}

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        addToFav: (state, action) => {
            state.favProducts.push(action.payload)
        },
        removeFromFav: (state, action) => {
            console.log(action.payload)
            state.favProducts = state.favProducts.filter(fav=> fav.id !== action.payload)
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload
        }

    },
    extraReducers(builder){
        builder
        .addCase(fetchProductsThunk.rejected , (state, action)=>{
            state.hasError = true,
            state.errorMessage = action.error.message
            state.isLoading = false
        })
        .addCase(fetchProductsThunk.pending, (state)=>{
            state.isLoading = true
            state.hasError = false
        })
        .addCase(fetchProductsThunk.fulfilled, (state, action)=>{
            state.isLoading = false,
            state.hasError = false,
            state.products = action.payload
        })
    }
})

const selectProductsState = state => state.productsReducer

export const selectSearchQuery = createSelector(
    selectProductsState,
    productsState => productsState.searchQuery
)

export const selectFilteredProducts = createSelector(
    selectProductsState,
    productsState => {
        const query = productsState.searchQuery.trim().toLowerCase()

        if (!query) {
            return productsState.products
        }

        return productsState.products.filter(product => {
            const title = product?.title?.toLowerCase() || ''
            const category = product?.category?.toLowerCase() || ''
            const brand = product?.brand?.toLowerCase() || ''

            return title.includes(query) || category.includes(query) || brand.includes(query)
        })
    }
)

export const {addToFav, removeFromFav, setSearchQuery} = productsSlice.actions
export default productsSlice.reducer
