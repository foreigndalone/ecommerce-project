import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/products/productsSlice.js'
import usersReducer from '../features/users/usersSlice.js'
import cartReducer, { saveCartItems, selectCartItems } from '../features/cart/cartSlice.js'

const store = configureStore({
    reducer: {
        productsReducer,
        usersReducer,
        cartReducer
    }
})

store.subscribe(() => {
    saveCartItems(selectCartItems(store.getState()))
})

export default store
