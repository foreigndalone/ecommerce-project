import { Link, NavLink } from 'react-router-dom'

import CartIcon from '../icons/Cart.png'

import { useDispatch } from 'react-redux'
import { toggleShowCart } from '../features/cart/cartSlice'

export default function Navbar() {
    const dispatch = useDispatch()

    const linkStyles = "text-gray-600 hover:text-amber-600 transition-colors duration-200 font-medium"
  
    const activeLinkStyles = ({ isActive }) => 
        `${linkStyles} ${isActive ? "text-amber-600 font-semibold" : ""}`

    const handleShowCart = () => {
        dispatch(toggleShowCart())
    }
  return (
        <nav className='sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md px-6 py-4'>

            <div className='mx-auto flex max-w-7xl items-center justify-between'>
                    <Link to='/'
                        className='text-2xl font-black tracking-tight text-gray-900 hover:text-amber-600 transition-colors'>
                        Shop By
                    </Link>

                <div className="flex center gap-8">

                    <NavLink to="/" className={activeLinkStyles}>
                        Home
                    </NavLink>

                    <NavLink to="/checkout" className={activeLinkStyles}>
                        Check Out
                    </NavLink>

                    <button onClick={handleShowCart} aria-label="Toggle cart">
                        <img src={CartIcon} className='w-6 cursor-pointer' alt="" />
                    </button>

                </div>

                <div className='flex items-center gap-4'>

                    <Link to='/auth'
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Sign Up
                    </Link>

                    <Link to='/auth' 
                        className="rounded-full bg-amber-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-500 transition-all active:scale-95">
                        Log Out
                    </Link>
                </div>
            </div>

        </nav>
  )
}
