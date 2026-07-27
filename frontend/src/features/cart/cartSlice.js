import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    showCart: false,
    cart: [],
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload
            const existingItem = state.cart.find(item => item.product.id === product.id)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.cart.push({ product, quantity: 1 })
            }
        },
        toggleShowCart: (state) => {
            state.showCart = !state.showCart
        }
    },
})

export const {addToCart, toggleShowCart} = cartSlice.actions
export default cartSlice.reducer
