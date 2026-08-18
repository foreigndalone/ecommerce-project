import { configureStore } from '@reduxjs/toolkit'
import { afterEach, describe, expect, it, vi } from 'vitest'

import productsReducer, {
  selectProductById,
} from '../products/productsSlice'
import usersReducer from '../users/usersSlice'
import adminProductsReducer, {
  archiveAdminProductThunk,
  createAdminProductThunk,
  updateAdminProductThunk,
} from './adminProductsSlice'
import { createTestProduct } from '../../test/productFactory'
import type { UsersState } from '../../types/users'

const createTestStore = (token: string | null = 'signed-token') => configureStore({
  reducer: {
    adminProductsReducer,
    productsReducer,
    usersReducer,
  },
  preloadedState: {
    usersReducer: {
      currentUser: token
        ? { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin' }
        : null,
      token,
      sessionStatus: token ? 'authenticated' : 'unauthenticated',
      isLoading: false,
      hasError: false,
      errorMessage: null,
      profileUpdateStatus: 'idle',
      profileUpdateError: null,
    } satisfies UsersState,
  },
})

const createPayload = () => ({
  title: ' Admin Phone ',
  description: ' Product from admin ',
  category: ' phones ',
  brand: ' Brand ',
  tags: [' phone ', ' tech '],
  price: 499,
  images: [' https://example.com/phone.png '],
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('adminProducts thunks', () => {
  it('createAdminProductThunk sends Authorization header and trims payload', async () => {
    const store = createTestStore()
    const createdProduct = createTestProduct({ id: 'created-product', title: 'Admin Phone' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(createdProduct),
    })

    vi.stubGlobal('fetch', fetchMock)

    await store.dispatch(createAdminProductThunk(createPayload()))

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/admin/products',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer signed-token',
          'Content-Type': 'application/json',
        }),
      })
    )
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(expect.objectContaining({
      title: 'Admin Phone',
      description: 'Product from admin',
      category: 'phones',
      brand: 'Brand',
      tags: ['phone', 'tech'],
      images: ['https://example.com/phone.png'],
    }))
    expect(selectProductById(store.getState(), createdProduct.id)).toEqual(createdProduct)
  })

  it('rejects admin product requests when token is missing', async () => {
    const store = createTestStore(null)
    const action = await store.dispatch(createAdminProductThunk(createPayload()))

    expect(action.payload).toBe('Authentication token is missing')
  })

  it('updateAdminProductThunk uses PATCH and encodeURIComponent(productId)', async () => {
    const store = createTestStore()
    const updatedProduct = createTestProduct({ id: 'product/id', title: 'Updated Phone' })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(updatedProduct),
    })

    vi.stubGlobal('fetch', fetchMock)

    await store.dispatch(updateAdminProductThunk({
      productId: 'product/id',
      updates: { title: ' Updated Phone ' },
    }))

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3000/api/admin/products/product%2Fid')
    expect(fetchMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      method: 'PATCH',
      headers: expect.objectContaining({ Authorization: 'Bearer signed-token' }),
    }))
  })

  it('archiveAdminProductThunk uses DELETE and removes archived product from public entities', async () => {
    const store = createTestStore()
    const product = createTestProduct({ id: 'product-to-archive' })
    const archivedProduct = { ...product, status: 'archived' as const }

    store.dispatch(createAdminProductThunk.fulfilled(product, 'create-request', createPayload()))

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(archivedProduct),
    }))

    await store.dispatch(archiveAdminProductThunk({ productId: product.id }))

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:3000/api/admin/products/${product.id}`,
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer signed-token' }),
      })
    )
    expect(selectProductById(store.getState(), product.id)).toBeUndefined()
  })

  it('handles non-JSON backend errors', async () => {
    const store = createTestStore()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
      json: vi.fn().mockRejectedValue(new Error('not json')),
    }))

    const action = await store.dispatch(createAdminProductThunk(createPayload()))

    expect(action.payload).toBe('Forbidden')
  })

  it('returns a readable timeout error', async () => {
    vi.useFakeTimers()
    const store = createTestStore()

    vi.stubGlobal('fetch', vi.fn((_, options) => {
      const request = Promise.withResolvers<Response>()
      const requestOptions = options as RequestInit

      requestOptions.signal?.addEventListener('abort', () => {
        request.reject(new DOMException('Aborted', 'AbortError'))
      })

      return request.promise
    }))

    const request = store.dispatch(createAdminProductThunk(createPayload()))
    await vi.advanceTimersByTimeAsync(8000)
    const action = await request

    expect(action.payload).toBe('Admin products request timed out')
  })
})
