import { configureStore } from '@reduxjs/toolkit'
import { describe, expect, it } from 'vitest'
import cartReducer, { addToCart, selectCartItemCount, selectCartTotal } from './cartSlice'
import productsReducer, { fetchProductsThunk } from '../products/productsSlice'
import { createTestProduct } from '../../test/productFactory'

const createTestStore = () => configureStore({
  reducer: {
    cartReducer,
    productsReducer,
  },
})

describe('cartSlice', () => {
  it('calculates totals from normalized cart quantities and product entities', () => {
    const store = createTestStore()
    const product = createTestProduct({
      id: '64f000000000000000000001',
      title: 'Phone',
      price: 299,
      stock: 10,
    })

    store.dispatch(fetchProductsThunk.fulfilled(
      { products: [product], total: 1, limit: 30, skip: 0 },
      'products-loaded',
      undefined
    ))
    store.dispatch(addToCart(product))
    store.dispatch(addToCart(product))

    expect(selectCartItemCount(store.getState())).toBe(2)
    expect(selectCartTotal(store.getState())).toBe(598)
  })
})
