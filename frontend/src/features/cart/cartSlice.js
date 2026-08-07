import { createSelector, createSlice } from "@reduxjs/toolkit";

const GUEST_CART_STORAGE_KEY = 'ecommerce.cart.guest'
const LEGACY_CART_STORAGE_KEY = 'ecommerce.cart.items'

export const getCartStorageKey = (currentUser) =>
    currentUser?.id
        ? `ecommerce.cart.user.${currentUser.id}`
        : GUEST_CART_STORAGE_KEY

export const loadCartItems = (currentUser) => {
    if (typeof window === 'undefined') return []

    try {
        const savedCart = window.localStorage.getItem(getCartStorageKey(currentUser))
            ?? (!currentUser?.id
                ? window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)
                : null)
        return savedCart ? JSON.parse(savedCart) : []
    } catch {
        return []
    }
}

export const saveCartItems = (currentUser, items) => {
    if (typeof window === 'undefined') return

    try {
        window.localStorage.setItem(
            getCartStorageKey(currentUser),
            JSON.stringify(items)
        )
    } catch {
        // Ignore unavailable or full localStorage and keep the Redux cart working.
    }
}

const initialState = {
    showCart: false,
    items: loadCartItems(),
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const productId = action.payload.id
            const existingItem = state.items.find(item => item.productId === productId)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push({ productId, quantity: 1 })
            }
        },
        removeFromCart: (state, action) => {
            const productId = action.payload.id

            const ifIn = state.items.find(item=>item.productId === productId)

            if (!ifIn) return
            if (ifIn.quantity>1) {
                ifIn.quantity -= 1
                return
            } 

            state.items = state.items.filter(item => item.productId !== productId)
        },
        toggleShowCart: (state) => {
            state.showCart = !state.showCart
        },
        closeCart: (state) => {
            state.showCart = false
        },
        replaceCart: (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : []
        },
    },
})

const selectCartState = state => state.cartReducer
const selectProductEntities = state => state.productsReducer.entities

export const selectCartItems = createSelector(
    selectCartState,
    cartState => cartState.items
)

export const selectShowCart = createSelector(
    selectCartState,
    cartState => cartState.showCart
)

export const selectCartItemsWithProducts = createSelector(
    [selectCartItems, selectProductEntities],
    (items, productEntities) => items
        .map(item => ({
            ...item,
            product: productEntities[item.productId],
        }))
        .filter(item => item.product)
)

export const selectCartTotal = createSelector(
    selectCartItemsWithProducts,
    cartItems => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
)

export const selectCartItemCount = createSelector(
    selectCartItems,
    items => items.reduce((total, item) => total + item.quantity, 0)
)

export const {addToCart, removeFromCart, toggleShowCart, closeCart, replaceCart} = cartSlice.actions
export default cartSlice.reducer
