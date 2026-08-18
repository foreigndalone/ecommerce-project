import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AdminProducts from '../AdminProducts'
import { renderWithProviders } from '../../test/renderWithProviders'

const usersState = {
  token: null,
  sessionStatus: 'unauthenticated',
  isLoading: false,
  hasError: false,
  errorMessage: null,
  profileUpdateStatus: 'idle',
  profileUpdateError: null,
}

describe('AdminProducts page access', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('redirects guests to login', () => {
    renderWithProviders(
      <Routes>
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/auth" element={<h1>Login required</h1>} />
      </Routes>,
      {
        route: '/admin/products',
        preloadedState: {
          usersReducer: {
            ...usersState,
            currentUser: null,
          },
        },
      }
    )

    expect(screen.getByRole('heading', { name: 'Login required' })).toBeInTheDocument()
  })

  it('shows access denied for non-admin users', () => {
    renderWithProviders(<AdminProducts />, {
      preloadedState: {
        usersReducer: {
          ...usersState,
          token: 'signed-token',
          sessionStatus: 'authenticated',
          currentUser: { id: 'user-id', name: 'User', email: 'user@example.com', role: 'user' },
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument()
  })

  it('shows admin products UI for admin users', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    renderWithProviders(<AdminProducts />, {
      preloadedState: {
        usersReducer: {
          ...usersState,
          token: 'signed-token',
          sessionStatus: 'authenticated',
          currentUser: { id: 'admin-id', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        },
      },
    })

    expect(screen.getByRole('heading', { name: 'Admin Products' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create product' })).toBeInTheDocument()
  })
})
