import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import LikeBTN from './LikeBTN'
import { selectFavoritesCount, selectIsFavorite } from '../features/favorites/favoritesSlice'
import { renderWithProviders } from '../test/renderWithProviders'

describe('LikeBTN', () => {
    it('toggles a product in favorites', async () => {
        const user = userEvent.setup()
        const product = { id: 1, title: 'Phone' }
        const { store } = renderWithProviders(<LikeBTN product={product} />)

        const addButton = screen.getByRole('button', { name: 'Add to favorites' })
        await user.click(addButton)

        expect(selectIsFavorite(store.getState(), product)).toBe(true)
        expect(selectFavoritesCount(store.getState())).toBe(1)
        expect(screen.getByRole('button', { name: 'Remove from favorites' })).toHaveAttribute('aria-pressed', 'true')

        await user.click(screen.getByRole('button', { name: 'Remove from favorites' }))

        expect(selectIsFavorite(store.getState(), product)).toBe(false)
        expect(selectFavoritesCount(store.getState())).toBe(0)
    })
})
