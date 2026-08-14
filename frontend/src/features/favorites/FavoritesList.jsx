import { Heart, Trash2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { removeFavorite, selectAllFavorites } from './favoritesSlice'

const FavoritesList = ({ onNavigate }) => {
  const dispatch = useDispatch()
  const favorites = useSelector(selectAllFavorites)

  if (favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <span className="favorites-empty-icon"><Heart aria-hidden="true" /></span>
        <strong>No favorites yet</strong>
        <p>Tap the heart on a product to keep it close.</p>
      </div>
    )
  }

  return (
    <ul className="favorites-list">
      {favorites.map((favorite) => {
        const image = favorite.images?.[0]

        return (
          <li key={favorite.id} className="favorite-row">
            <Link
              to={`/product/${favorite.id}`}
              onClick={onNavigate}
              className="favorite-row-link"
            >
              <span className="favorite-row-media">
                {image ? <img src={image} alt="" /> : <Heart aria-hidden="true" />}
              </span>
              <span className="favorite-row-copy">
                <strong>{favorite.title}</strong>
                {favorite.price != null && <span>${favorite.price}</span>}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => dispatch(removeFavorite(favorite))}
              aria-label={`Remove ${favorite.title} from favorites`}
              className="favorite-row-remove"
            >
              <Trash2 aria-hidden="true" />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default FavoritesList
