import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'

import favoritesReducer, {
    addFavorite,
    clearFavorites,
    removeFavorite,
    selectAllFavorites,
    selectFavoritesCount,
    selectIsFavorite,
    toggleFavorite,
} from './favoritesSlice'

const createTestStore = () => configureStore({
    reducer: { favoritesReducer },
})

describe('favoritesSlice', () => {
    it('adds favorites without duplicates and supports objects and IDs', () => {
        const store = createTestStore()
        const product = { id: 1, title: 'Phone' }

        store.dispatch(addFavorite(product))
        store.dispatch(addFavorite({ id: 1, title: 'Updated Phone' }))
        store.dispatch(addFavorite(2))

        expect(selectAllFavorites(store.getState())).toEqual([product, 2])
        expect(selectFavoritesCount(store.getState())).toBe(2)
        expect(selectIsFavorite(store.getState(), 1)).toBe(true)
        expect(selectIsFavorite(store.getState(), { id: 2 })).toBe(true)
    })

    it('toggles, removes, and clears favorites', () => {
        const store = createTestStore()

        store.dispatch(toggleFavorite({ id: 1, title: 'Phone' }))
        store.dispatch(toggleFavorite(1))
        store.dispatch(addFavorite({ id: 2, title: 'Laptop' }))
        store.dispatch(removeFavorite(2))
        store.dispatch(addFavorite(3))
        store.dispatch(clearFavorites())

        expect(selectAllFavorites(store.getState())).toEqual([])
        expect(selectFavoritesCount(store.getState())).toBe(0)
    })
})
