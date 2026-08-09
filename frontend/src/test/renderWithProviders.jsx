import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import cartReducer from '../features/cart/cartSlice'
import favoritesReducer from '../features/favorites/favoritesSlice'
import productsReducer from '../features/products/productsSlice'
import usersReducer, { createAuthListenerMiddleware } from '../features/users/usersSlice'

export const createTestStore = (preloadedState) => {
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
    preloadedState,
  })
}

export const renderWithProviders = (
  ui,
  {
    route = '/',
    preloadedState,
    store = createTestStore(preloadedState),
  } = {}
) => {
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  )

  return { store, ...result }
}
