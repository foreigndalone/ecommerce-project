import { configureStore } from '@reduxjs/toolkit'
import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

import cartReducer from '../features/cart/cartSlice'
import favoritesReducer from '../features/favorites/favoritesSlice'
import productsReducer from '../features/products/productsSlice'
import usersReducer, { createAuthListenerMiddleware } from '../features/users/usersSlice'

export const createTestStore = (preloadedState?: object) => {
  const authListenerMiddleware = createAuthListenerMiddleware()

  return configureStore({
    reducer: {
      productsReducer,
      usersReducer,
      cartReducer,
      favoritesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(authListenerMiddleware.middleware),
    ...(preloadedState ? { preloadedState } : {}),
  })
}

type TestStore = ReturnType<typeof createTestStore>

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  preloadedState?: object
  store?: TestStore
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) => {
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>,
    renderOptions
  )

  return { store, ...result }
}
