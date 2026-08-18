// path: src/features/cart/cartSlice.ts
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Product } from '../../types/products'

export interface CartItem {
    productId: string
    quantity: number
}

export interface CartState {
    showCart: boolean
    items: CartItem[]
}

export interface CartItemWithProduct extends CartItem {
    product: Product
}

interface CurrentUserForCart {
    id?: string | number
}

interface CartRootState {
    cartReducer: CartState
    productsReducer: {
        entities: Record<string, Product | undefined>
    }
}

const GUEST_CART_STORAGE_KEY = 'ecommerce.cart.guest'
const LEGACY_CART_STORAGE_KEY = 'ecommerce.cart.items'

export const getCartStorageKey = (currentUser?: CurrentUserForCart | null) =>
    currentUser?.id
        ? `ecommerce.cart.user.${currentUser.id}`
        : GUEST_CART_STORAGE_KEY

const isCartItem = (item: unknown): item is CartItem => {
    if (!item || typeof item !== 'object') return false

    const cartItem = item as CartItem

    return typeof cartItem.productId === 'string'
        && Number.isInteger(cartItem.quantity)
        && cartItem.quantity > 0
}

export const loadCartItems = (currentUser?: CurrentUserForCart | null): CartItem[] => {
    if (typeof window === 'undefined') return []

    try {
        const savedCart = window.localStorage.getItem(getCartStorageKey(currentUser))
            ?? (!currentUser?.id
                ? window.localStorage.getItem(LEGACY_CART_STORAGE_KEY)
                : null)
        const parsedCart = savedCart ? JSON.parse(savedCart) : []

        return Array.isArray(parsedCart) ? parsedCart.filter(isCartItem) : []
    } catch {
        return []
    }
}

export const saveCartItems = (
    currentUser: CurrentUserForCart | null | undefined,
    items: CartItem[]
) => {
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

const initialState: CartState = {
    showCart: false,
    items: loadCartItems(),
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Product>) => {
            const productId = action.payload.id
            const existingItem = state.items.find(item => item.productId === productId)

            if (existingItem) {
                existingItem.quantity += 1
            } else {
                state.items.push({ productId, quantity: 1 })
            }
        },
        removeFromCart: (state, action: PayloadAction<Pick<Product, 'id'>>) => {
            const productId = action.payload.id

            const ifIn = state.items.find(item => item.productId === productId)

            if (!ifIn) return
            if (ifIn.quantity > 1) {
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
        replaceCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload
        },
    },
})

const selectCartState = (state: CartRootState) => state.cartReducer
const selectProductEntities = (state: CartRootState) => state.productsReducer.entities

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
        .filter((item): item is CartItemWithProduct => Boolean(item.product))
)

export const selectCartTotal = createSelector(
    selectCartItemsWithProducts,
    cartItems => cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
)

export const selectCartItemCount = createSelector(
    selectCartItems,
    items => items.reduce((total, item) => total + item.quantity, 0)
)

export const {
    addToCart,
    removeFromCart,
    toggleShowCart,
    closeCart,
    replaceCart,
} = cartSlice.actions

export default cartSlice.reducer
