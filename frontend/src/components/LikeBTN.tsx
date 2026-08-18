import { Heart } from 'lucide-react'
import type { MouseEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import type { AppDispatch, RootState } from '../app/store'
import {
    selectIsFavorite,
    toggleFavorite,
} from '../features/favorites/favoritesSlice'
import type { Product } from '../types/products'

interface LikeBTNProps {
    product: Product
}

export default function LikeBTN({ product }: LikeBTNProps) {
    const dispatch = useDispatch<AppDispatch>()
    const isFavorite = useSelector((state: RootState) => selectIsFavorite(state, product))

    const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        dispatch(toggleFavorite(product))
    }

    return (
        <button
            type="button"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            className="favorite-button"
        >
            <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
            />
        </button>
    )
}
