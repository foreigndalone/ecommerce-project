import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/products/productsSlice.js'

const store = configureStore({
    reducer: {
        productsReducer
    }
})

export default store