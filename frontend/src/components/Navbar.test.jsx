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
          currentUser: {
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            points: 150,
          },
          token: 'signed-token',
          isLoading: false,
          hasError: false,
          errorMessage: null,
        },
      },
    })

    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('150 pts')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Log Out' }))

    expect(store.getState().usersReducer.currentUser).toBeNull()
    expect(store.getState().usersReducer.token).toBeNull()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })

  it('keeps Sign Up and Login links for unauthenticated users', () => {
    renderWithProviders(<Navbar />)

    expect(screen.getByRole('link', { name: 'Sign Up' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Log Out' })).not.toBeInTheDocument()
  })
})
