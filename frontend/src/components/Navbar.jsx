import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, ShoppingBag, UserRound, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItemCount, toggleShowCart } from '../features/cart/cartSlice'
import FavoritesList from '../features/favorites/FavoritesList.jsx'
import { selectFavoritesCount } from '../features/favorites/favoritesSlice.js'
import { logout, selectCurrentUser, selectIsAuthenticated } from '../features/users/usersSlice.js'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const favoritesMenuRef = useRef(null)
  const [showFavorites, setShowFavorites] = useState(false)
  const currentUser = useSelector(selectCurrentUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const cartCount = useSelector(selectCartItemCount)
  const favoritesCount = useSelector(selectFavoritesCount)
  const userPoints = currentUser?.points ?? currentUser?.balance ?? 0

  const handleLogout = () => {
    dispatch(logout())
    navigate('/auth?mode=login')
  }

  useEffect(() => {
    if (!showFavorites) return

    const closeMenu = (event) => {
      if (event.key === 'Escape' || !favoritesMenuRef.current?.contains(event.target)) {
        setShowFavorites(false)
      }
    }

    document.addEventListener('keydown', closeMenu)
    document.addEventListener('pointerdown', closeMenu)
    return () => {
      document.removeEventListener('keydown', closeMenu)
      document.removeEventListener('pointerdown', closeMenu)
    }
  }, [showFavorites])

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#dce3ec] bg-white" aria-label="Main navigation">
      <div className="shop-shell flex h-full items-center justify-between gap-4">
        <Link to="/" className="flex min-h-11 items-center text-xl font-black tracking-[-0.06em] text-[#10233f] no-underline" aria-label="ShopBy home">
          SHOP<span className="text-[#1557ff]">BY</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <a href="/#catalog" className="hidden min-h-11 items-center px-3 text-sm font-bold text-[#10233f] no-underline hover:text-[#1557ff] sm:flex">Shop</a>
          <div className="favorites-menu" ref={favoritesMenuRef}>
            <button
              type="button"
              onClick={() => setShowFavorites((isOpen) => !isOpen)}
              aria-label={`Favorites, ${favoritesCount} items`}
              aria-expanded={showFavorites}
              aria-controls="favorites-popover"
              className={`nav-icon-button ${showFavorites ? 'is-active' : ''}`}
            >
              <Heart className={favoritesCount ? 'fill-current' : ''} aria-hidden="true" />
              {favoritesCount > 0 && <span className="nav-icon-count">{favoritesCount}</span>}
            </button>

            {showFavorites && (
              <section id="favorites-popover" className="favorites-popover" aria-label="Favorite products">
                <div className="favorites-popover-head">
                  <div>
                    <p className="section-kicker">Saved for later</p>
                    <h2>Favorites</h2>
                  </div>
                  <button type="button" onClick={() => setShowFavorites(false)} aria-label="Close favorites" className="favorites-close">
                    <X aria-hidden="true" />
                  </button>
                </div>
                <FavoritesList onNavigate={() => setShowFavorites(false)} />
              </section>
            )}
          </div>
          {isAuthenticated ? (
            <>
              <Link to="/account" aria-label="Open account" className="account-link">
                <UserRound className="h-4 w-4" aria-hidden="true" />
                <span className="account-copy"><span>{currentUser.name}</span><small>{userPoints} pts</small></span>
              </Link>
              <button type="button" onClick={handleLogout} aria-label="Log Out" className="grid h-11 w-11 place-items-center border-0 bg-transparent text-[#58677a] hover:text-[#1557ff]">
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth?mode=signup" className="hidden min-h-11 items-center px-2 text-sm font-bold text-[#10233f] no-underline hover:text-[#1557ff] sm:flex">Sign Up</Link>
              <Link to="/auth?mode=login" className="flex min-h-11 items-center px-2 text-sm font-bold text-[#10233f] no-underline hover:text-[#1557ff]">Login</Link>
            </>
          )}
          <button type="button" onClick={() => dispatch(toggleShowCart())} aria-label={`Open cart, ${cartCount} items`} className="flex h-11 items-center gap-2 border-0 bg-[#10233f] px-3 text-white hover:bg-[#1557ff] sm:px-4">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="font-mono text-xs font-bold">{String(cartCount).padStart(2, '0')}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
