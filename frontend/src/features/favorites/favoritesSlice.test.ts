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
import { createTestProduct } from '../../test/productFactory'

const createTestStore = () => configureStore({
    reducer: { favoritesReducer },
})

describe('favoritesSlice', () => {
    it('adds product favorites without duplicates', () => {
        const store = createTestStore()
        const product = createTestProduct({ id: 'product-1', title: 'Phone' })

        store.dispatch(addFavorite(product))
        store.dispatch(addFavorite(createTestProduct({ id: 'product-1', title: 'Updated Phone' })))

        expect(selectAllFavorites(store.getState())).toEqual([product])
        expect(selectFavoritesCount(store.getState())).toBe(1)
        expect(selectIsFavorite(store.getState(), product)).toBe(true)
    })

    it('toggles, removes, and clears favorites', () => {
        const store = createTestStore()
        const phone = createTestProduct({ id: 'product-1', title: 'Phone' })
        const laptop = createTestProduct({ id: 'product-2', title: 'Laptop' })
        const headphones = createTestProduct({ id: 'product-3', title: 'Headphones' })

        store.dispatch(toggleFavorite(phone))
        store.dispatch(toggleFavorite(phone))
        store.dispatch(addFavorite(laptop))
        store.dispatch(removeFavorite(laptop))
        store.dispatch(addFavorite(headphones))
        store.dispatch(clearFavorites())

        expect(selectAllFavorites(store.getState())).toEqual([])
        expect(selectFavoritesCount(store.getState())).toBe(0)
    })
})
