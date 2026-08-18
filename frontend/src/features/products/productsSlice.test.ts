import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'
import productsReducer, {
  fetchProductsThunk,
  fetchProductByIdThunk,
  selectProductById,
  selectProductsErrorMessage,
  selectFilteredProducts,
  setSearchQuery,
  setSelectedBrand,
  setSelectedCategory,
} from './productsSlice'
import { createTestProduct } from '../../test/productFactory'

const createTestStore = () => configureStore({
  reducer: {
    productsReducer,
  },
})

const products = [
  createTestProduct({
    id: '64f000000000000000000001',
    title: 'Essence Mascara',
    brand: 'Essence',
    category: 'beauty',
    tags: ['makeup', 'eyes'],
  }),
  createTestProduct({
    id: '64f000000000000000000002',
    title: 'Apple MacBook',
    brand: 'Apple',
    category: 'laptops',
    tags: ['computer'],
  }),
]

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('productsSlice filtering', () => {
  it('filters by search text, category, brand, and tags without duplicating filtered state', () => {
    const store = createTestStore()

    store.dispatch(fetchProductsThunk.fulfilled(
      { products, total: 2, limit: 30, skip: 0 },
      'products-loaded',
      undefined
    ))
    store.dispatch(setSearchQuery('makeup'))
    store.dispatch(setSelectedCategory('beauty'))
    store.dispatch(setSelectedBrand('Essence'))

    expect(selectFilteredProducts(store.getState())).toEqual([products[0]])
  })
})

describe('productsSlice API thunks', () => {
  it('stores products from the backend response products field', async () => {
    const store = createTestStore()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products,
        total: 2,
        limit: 30,
        skip: 0,
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    await store.dispatch(fetchProductsThunk({
      search: ' mascara ',
      category: ' beauty ',
      brand: ' Essence ',
    }))

    expect(fetchMock.mock.calls[0][0]).toContain('/products?')
    expect(fetchMock.mock.calls[0][0]).toContain('search=mascara')
    expect(selectProductById(store.getState(), products[0].id)).toEqual(products[0])
  })

  it('fetches the full list when only one product was loaded by id', async () => {
    const store = createTestStore()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        products,
        total: 2,
        limit: 30,
        skip: 0,
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    store.dispatch(fetchProductByIdThunk.fulfilled(products[1], 'product-loaded', products[1].id))
    await store.dispatch(fetchProductsThunk())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(selectProductById(store.getState(), products[0].id)).toEqual(products[0])
  })

  it('keeps product ids as strings when fetching one product', async () => {
    const store = createTestStore()
    const product = { ...products[0] }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(product),
    }))

    await store.dispatch(fetchProductByIdThunk(product.id))

    expect(selectProductById(store.getState(), product.id)).toEqual(product)
  })

  it('stores rejectWithValue payload as errorMessage', () => {
    const store = createTestStore()

    store.dispatch(fetchProductsThunk.rejected(
      new Error('Rejected'),
      'request-id',
      undefined,
      { type: 'server', message: 'Backend says no', status: 500 }
    ))

    expect(selectProductsErrorMessage(store.getState())).toBe('Backend says no')
  })

  it('handles non-JSON backend errors', async () => {
    const store = createTestStore()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Service Unavailable',
      json: vi.fn().mockRejectedValue(new Error('not json')),
    }))

    await store.dispatch(fetchProductsThunk({ search: 'phone' }))

    expect(selectProductsErrorMessage(store.getState())).toBe('Service Unavailable')
  })

  it('returns a typed server error from backend responses', async () => {
    const store = createTestStore()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: vi.fn().mockResolvedValue({ message: 'Invalid products query' }),
    }))

    const action = await store.dispatch(fetchProductsThunk({ search: 'phone' }))

    expect(action.payload).toEqual({
      type: 'server',
      message: 'Invalid products query',
      status: 400,
    })
    expect(selectProductsErrorMessage(store.getState())).toBe('Invalid products query')
  })

  it('returns a readable timeout error', async () => {
    vi.useFakeTimers()
    const store = createTestStore()

    vi.stubGlobal('fetch', vi.fn((_, options) => {
      const request = Promise.withResolvers()

      options.signal.addEventListener('abort', () => {
        request.reject(new DOMException('Aborted', 'AbortError'))
      })

      return request.promise
    }))

    const request = store.dispatch(fetchProductsThunk({ search: 'phone' }))
    await vi.advanceTimersByTimeAsync(8000)
    const action = await request

    expect(action.payload).toEqual({
      type: 'timeout',
      message: 'Products request timed out',
    })
    expect(selectProductsErrorMessage(store.getState())).toBe('Products request timed out')
  })
})
