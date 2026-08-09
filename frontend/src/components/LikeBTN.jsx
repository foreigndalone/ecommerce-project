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
            className="favorite-button"
        >
            <Heart
                className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
            />
        </button>
    )
}
