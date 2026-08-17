// path: src/features/favorites/favoritesSlice.ts
import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { Product } from '../../types/products'

export interface FavoritesState {
    items: Product[]
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

interface FavoritesRootState {
    favoritesReducer: FavoritesState
}

const initialState: FavoritesState = {
    items: [],
    status: 'idle',
    error: null,
}

const getFavoriteId = (favorite: Product) => favorite.id

const isSameFavorite = (favorite: Product, candidate: Product) => {
    const favoriteId = getFavoriteId(favorite)
    const candidateId = getFavoriteId(candidate)

    return favoriteId === candidateId
}

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<Product>) => {
            const exists = state.items.some((item) =>
                isSameFavorite(item, action.payload)
            )

            if (!exists) {
                state.items.push(action.payload)
            }
        },
        removeFavorite: (state, action: PayloadAction<Product>) => {
            state.items = state.items.filter((item) =>
                !isSameFavorite(item, action.payload)
            )
        },
        toggleFavorite: (state, action: PayloadAction<Product>) => {
            const existingIndex = state.items.findIndex((item) =>
                isSameFavorite(item, action.payload)
            )

            if (existingIndex >= 0) {
                state.items.splice(existingIndex, 1)
            } else {
                state.items.push(action.payload)
            }
        },
        clearFavorites: (state) => {
            state.items = []
        },
    },
})

const selectFavoritesState = (state: FavoritesRootState) => state.favoritesReducer

export const selectAllFavorites = (state: FavoritesRootState) =>
    selectFavoritesState(state).items

export const selectIsFavorite = (state: FavoritesRootState, favorite: Product) =>
    selectAllFavorites(state).some((item) => isSameFavorite(item, favorite))

export const selectFavoritesCount = createSelector(
    [selectFavoritesState],
    (favoritesState) => favoritesState.items.length
)

export const {
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
} = favoritesSlice.actions

export default favoritesSlice.reducer
