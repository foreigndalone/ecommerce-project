import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'

export const fetchProductsThunk = createAsyncThunk('/products/fetch', async()=>{
    try {
        const result = await fetch('https://dummyjson.com/products')
        const data = await result.json()
        console.log(data, 'DATA WATAFA')
        console.log(data.products , "DATA + PRODUCTS WATAFA")
        return data.products
    } catch (error) {
        console.error(error)
    }
})



const initialState = {
    products: [],
    favProducts: [],
    hasError: false,
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
        }

    },
    extraReducers(builder){
        builder
        .addCase(fetchProductsThunk.rejected , (state, action)=>{
            state.hasError = action.error.message,
            state.isLoading = false
        })
        .addCase(fetchProductsThunk.pending, (state, action)=>{
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

export const {addToFav, removeFromFav} = productsSlice.actions
export default productsSlice.reducer