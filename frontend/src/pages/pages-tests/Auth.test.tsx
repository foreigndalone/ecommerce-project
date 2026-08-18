import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Auth from '../Auth'
import { renderWithProviders } from '../../test/renderWithProviders'

const renderAuth = (route = '/auth') => renderWithProviders(
  <Routes>
    <Route path="/auth" element={<Auth />} />
    <Route path="/" element={<h1>Home page</h1>} />
  </Routes>,
  { route }
)

describe('Auth page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stays on the form and shows the backend registration error', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'A user with this email already exists' }),
    }))

    renderAuth()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(await screen.findByText('A user with this email already exists')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('automatically logs in and navigates after successful registration', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-id', name: 'Test User', email: 'test@example.com' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
          token: 'signed-token',
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const { store } = renderAuth()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(await screen.findByRole('heading', { name: 'Home page' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[0][0]).toContain('/api/users/signUp')
    expect(fetchMock.mock.calls[1][0]).toContain('/api/users/login')
    expect(store.getState().usersReducer.currentUser?.name).toBe('Test User')
    expect(store.getState().usersReducer.token).toBe('signed-token')
  })

  it('stays on Auth when automatic login fails after registration', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'user-id', name: 'Test User', email: 'test@example.com' }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid email or password' }),
      }))

    renderAuth()
    await user.type(screen.getByLabelText('Name'), 'Test User')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument()
  })

  it('logs in and stores the user and token in memory', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
        token: 'signed-token',
      }),
    }))

    const { store } = renderAuth('/auth?mode=login')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByRole('heading', { name: 'Home page' })).toBeInTheDocument()
    expect(store.getState().usersReducer.currentUser?.name).toBe('Test User')
    expect(store.getState().usersReducer.token).toBe('signed-token')
  })
})
