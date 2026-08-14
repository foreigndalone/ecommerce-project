import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import UserAccount from './UserAccount.jsx'
import { renderWithProviders } from '../test/renderWithProviders.jsx'

describe('UserAccount', () => {
  it('redirects guests to login', () => {
    renderWithProviders(
      <Routes>
        <Route path="/account" element={<UserAccount />} />
        <Route path="/auth" element={<h1>Login required</h1>} />
      </Routes>,
      { route: '/account' }
    )

    expect(screen.getByRole('heading', { name: 'Login required' })).toBeInTheDocument()
  })

  it('shows account details for an authenticated user', () => {
    renderWithProviders(<UserAccount />, {
      preloadedState: {
        usersReducer: {
          currentUser: { id: 1, name: 'Elvis', email: 'elvis@example.com' },
          token: 'signed-token',
          sessionStatus: 'authenticated',
          isLoading: false,
          hasError: false,
          errorMessage: null,
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Elvis' })).toBeInTheDocument()
    expect(screen.getByText('elvis@example.com')).toBeInTheDocument()
  })
})
