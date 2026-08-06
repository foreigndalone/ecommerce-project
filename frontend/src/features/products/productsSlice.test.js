import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import productsReducer, {
  fetchProductsThunk,
  selectFilteredProducts,
  setSearchQuery,
  setSelectedBrand,
  setSelectedCategory,
} from './productsSlice'

const createTestStore = () => configureStore({
  reducer: {
    productsReducer,
  },
})

const products = [
  {
    id: 1,
    title: 'Essence Mascara',
    brand: 'Essence',
    category: 'beauty',
    tags: ['makeup', 'eyes'],
  },
  {
    id: 2,
    title: 'Apple MacBook',
    brand: 'Apple',
    category: 'laptops',
    tags: ['computer'],
  },
]

describe('productsSlice filtering', () => {
  it('filters by search text, category, brand, and tags without duplicating filtered state', () => {
    const store = createTestStore()

    store.dispatch(fetchProductsThunk.fulfilled(products, 'products-loaded'))
    store.dispatch(setSearchQuery('makeup'))
    store.dispatch(setSelectedCategory('beauty'))
    store.dispatch(setSelectedBrand('Essence'))

    expect(selectFilteredProducts(store.getState())).toEqual([products[0]])
  })
})
