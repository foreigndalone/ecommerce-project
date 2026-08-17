import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Product from '../Product'
import { renderWithProviders } from '../../test/renderWithProviders'

describe('Product page', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a loading state while fetching a product by route id', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    renderWithProviders(
      <Routes>
        <Route path="/product/:id" element={<Product />} />
      </Routes>,
      { route: '/product/64f000000000000000000001' }
    )

    expect(screen.getByText('Loading the product...')).toBeInTheDocument()
  })
})
