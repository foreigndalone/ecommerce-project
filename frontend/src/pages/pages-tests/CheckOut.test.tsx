import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CheckOut from '../CheckOut'
import { renderWithProviders } from '../../test/renderWithProviders'

describe('CheckOut page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('disables order placement and shows zero total when the cart is empty', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    renderWithProviders(<CheckOut />)

    expect(screen.getByText('Cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Total Price: $0.00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fill the cart' })).toBeDisabled()
  })
})
