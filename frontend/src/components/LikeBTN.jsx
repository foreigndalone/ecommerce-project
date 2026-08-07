import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'

import {
    selectIsFavorite,
    toggleFavorite,
} from '../features/favorites/favoritesSlice.js'

export default function LikeBTN({ product }) {
    const dispatch = useDispatch()
    const isFavorite = useSelector((state) => selectIsFavorite(state, product))

    const handleToggleFavorite = (event) => {
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
            className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur-sm transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 active:scale-95 ${
                isFavorite
                    ? 'border-rose-200 text-rose-500'
                    : 'border-gray-100 text-rose-500 hover:border-rose-200 hover:bg-rose-50'
            }`}
        >
            <Heart
                className={`h-4 w-4 transition-colors ${isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
            />
        </button>
    )
}
