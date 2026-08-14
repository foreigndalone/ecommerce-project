import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import UserAccount from './UserAccount.jsx'
import { renderWithProviders } from '../test/renderWithProviders.jsx'

describe('UserAccount', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

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

    expect(screen.getByRole('heading', { name: 'Your account.' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Full name' })).toHaveValue('Elvis')
    expect(screen.getByText('elvis@example.com')).toBeInTheDocument()
  })

  it('updates the profile through the authenticated API and Redux', async () => {
    const user = userEvent.setup()
    const updatedUser = { id: 1, name: 'Elvis B', email: 'new@example.com' }
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => updatedUser,
    })
    const { store } = renderWithProviders(<UserAccount />, {
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

    await user.click(screen.getByRole('button', { name: 'Edit profile' }))
    const nameInput = screen.getByRole('textbox', { name: 'Full name' })
    const emailInput = screen.getByRole('textbox', { name: 'Email address' })
    await user.clear(nameInput)
    await user.type(nameInput, 'Elvis B')
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/me',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer signed-token' }),
        body: JSON.stringify({ name: 'Elvis B', email: 'new@example.com' }),
      })
    )
    expect(store.getState().usersReducer.currentUser).toEqual(updatedUser)
    expect(await screen.findByText('Profile updated')).toBeInTheDocument()
  })
})
