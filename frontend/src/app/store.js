import { configureStore } from "@reduxjs/toolkit";
import productsReducer from '../features/products/productsSlice.js'
import usersReducer, {
    createAuthListenerMiddleware,
    selectCurrentUser,
} from '../features/users/usersSlice.js'
import favoritesReducer from '../features/favorites/favoritesSlice.js'
import cartReducer, {
    getCartStorageKey,
    loadCartItems,
    replaceCart,
    saveCartItems,
    selectCartItems,
} from '../features/cart/cartSlice.js'

const authListenerMiddleware = createAuthListenerMiddleware()

const store = configureStore({
    reducer: {
        productsReducer,
        usersReducer,
        cartReducer,
        favoritesReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
})

let activeCartKey = getCartStorageKey(selectCurrentUser(store.getState()))

store.subscribe(() => {
    const state = store.getState()
    const currentUser = selectCurrentUser(state)
    const nextCartKey = getCartStorageKey(currentUser)

    if (nextCartKey !== activeCartKey) {
        activeCartKey = nextCartKey
        store.dispatch(replaceCart(loadCartItems(currentUser)))
        return
    }

    saveCartItems(currentUser, selectCartItems(state))
})

export default store
