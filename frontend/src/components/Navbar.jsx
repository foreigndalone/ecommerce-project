import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Coins, LogOut, UserRound } from 'lucide-react'

import CartIcon from '../icons/Cart.png'

import { useDispatch, useSelector } from 'react-redux'
import { toggleShowCart } from '../features/cart/cartSlice'
import {
    logout,
    selectCurrentUser,
    selectIsAuthenticated,
} from '../features/users/usersSlice.js'

export default function Navbar() {


    const dispatch = useDispatch()
    const navigate = useNavigate()
    const currentUser = useSelector(selectCurrentUser)
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const userPoints = currentUser?.points ?? currentUser?.balance ?? 0

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
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-2xl border border-gray-100/80 bg-white/85 p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                                <button
                                    type="button"
                                    aria-label="User account"
                                    className="flex h-10 min-w-0 items-center gap-2 rounded-xl bg-gray-100/90 px-3 text-gray-700 transition-colors hover:bg-gray-200/80 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                                >
                                    <UserRound className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
                                    <span className="max-w-28 truncate text-sm font-semibold sm:max-w-36">
                                        {currentUser.name}
                                    </span>
                                </button>

                                <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-amber-100/80 bg-amber-50/80 px-3 text-amber-600">
                                    <Coins className="h-4 w-4" aria-hidden="true" />
                                    <span className="whitespace-nowrap text-sm font-bold">
                                        {userPoints} pts
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                aria-label="Log Out"
                                title="Log Out"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-white/70 text-gray-500 shadow-sm backdrop-blur-md transition-all hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                            >
                                <LogOut className="h-4 w-4" aria-hidden="true" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to='/auth?mode=signup'
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
