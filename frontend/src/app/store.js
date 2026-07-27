import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/products/productsSlice.js'
import userReducer from '../features/users/usersSlice.js'
import cartReducer from '../features/cart/cartSlice.js'

const store = configureStore({
    reducer: {
        productsReducer,
        userReducer,
        cartReducer
    }
})

export default store