import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import cartReducer, { addToCart, selectCartItemCount, selectCartTotal } from './cartSlice'
import productsReducer, { fetchProductsThunk } from '../products/productsSlice'

const createTestStore = () => configureStore({
  reducer: {
    cartReducer,
    productsReducer,
  },
})

describe('cartSlice', () => {
  it('calculates totals from normalized cart quantities and product entities', () => {
    const store = createTestStore()
    const product = { id: '64f000000000000000000001', title: 'Phone', price: 299, stock: 10 }

    store.dispatch(fetchProductsThunk.fulfilled({ products: [product] }, 'products-loaded'))
    store.dispatch(addToCart(product))
    store.dispatch(addToCart(product))

    expect(selectCartItemCount(store.getState())).toBe(2)
    expect(selectCartTotal(store.getState())).toBe(598)
  })
})
