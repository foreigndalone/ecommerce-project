import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import cartReducer from '../features/cart/cartSlice'
import productsReducer from '../features/products/productsSlice'
import usersReducer from '../features/users/usersSlice'

export const createTestStore = (preloadedState) => configureStore({
  reducer: {
    productsReducer,
    usersReducer,
    cartReducer,
  },
  preloadedState,
})

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
