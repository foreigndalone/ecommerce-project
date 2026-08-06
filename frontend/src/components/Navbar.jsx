import { Link, NavLink, useNavigate } from 'react-router-dom'

import CartIcon from '../icons/Cart.png'

import { useDispatch, useSelector } from 'react-redux'
import { toggleShowCart } from '../features/cart/cartSlice'
import { logout } from '../features/users/usersSlice.js'

export default function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { currentUser, token } = useSelector((state) => state.usersReducer)
    const isAuthenticated = Boolean(currentUser && token)

    const linkStyles = "text-gray-600 hover:text-amber-600 transition-colors duration-200 font-medium"
  
    const activeLinkStyles = ({ isActive }) => 
        `${linkStyles} ${isActive ? "text-amber-600 font-semibold" : ""}`

    const handleShowCart = () => {
        dispatch(toggleShowCart())
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/auth?mode=login')
    }
  return (
        <nav className='fixed inset-x-0 top-0 z-50 w-full border-b border-gray-100 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-md'>

            <div className='mx-auto flex max-w-7xl items-center justify-between'>
                    <Link to='/'
                        className='text-2xl font-black tracking-tight text-gray-900 hover:text-amber-600 transition-colors'>
                        Shop By
                    </Link>

                <div className="flex items-center gap-8">

                    <NavLink to="/" className={activeLinkStyles}>
                        Home
                    </NavLink>

                    <NavLink to="/checkout" className={activeLinkStyles}>
                        Check Out
                    </NavLink>

                    <button
                        type="button"
                        onClick={handleShowCart}
                        aria-label="Toggle cart"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 transition hover:border-amber-500 hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    >
                        <img src={CartIcon} className='w-6 cursor-pointer' alt="" />
                    </button>

                </div>

                <div className='flex items-center gap-4'>

                    {isAuthenticated ? (
                        <>
                            <span className="text-sm font-medium text-gray-600">
                                {currentUser.name}
                            </span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-500 transition-all active:scale-95"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to='/auth'
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Sign Up
                            </Link>
                            <Link to='/auth?mode=login'
                                className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-500 transition-all active:scale-95">
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>

        </nav>
  )
}
