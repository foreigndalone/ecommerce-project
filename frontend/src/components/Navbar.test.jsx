import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import Navbar from './Navbar.jsx'
import { renderWithProviders } from '../test/renderWithProviders.jsx'

describe('Navbar authentication controls', () => {
  it('logs out and clears the in-memory authentication state', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(<Navbar />, {
      preloadedState: {
        usersReducer: {
          currentUser: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
          token: 'signed-token',
          isLoading: false,
          hasError: false,
          errorMessage: null,
        },
      },
    })

    expect(screen.getByText('Test User')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Log Out' }))

    expect(store.getState().usersReducer.currentUser).toBeNull()
    expect(store.getState().usersReducer.token).toBeNull()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})
