import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import CartList from './CartList'
import { closeCart, selectCartItemCount, selectShowCart } from './cartSlice'

const CartSidebar = () => {
  const dispatch = useDispatch()
  const showCart = useSelector(selectShowCart)
  const itemCount = useSelector(selectCartItemCount)

  useEffect(() => {
    if (!showCart) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(closeCart())
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [dispatch, showCart])

  return (
    <div
      className={`fixed inset-0 z-[60] transition ${
        showCart ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      aria-hidden={!showCart}
    >
      <button
        type="button"
        aria-label="Close cart"
        onClick={() => dispatch(closeCart())}
        className={`absolute inset-0 bg-gray-900/40 transition-opacity duration-300 ${
          showCart ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-out sm:w-1/2 lg:w-1/3 ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 id="cart-sidebar-title" className="text-lg font-black tracking-tight text-gray-900">
              Cart
            </h2>
            <p className="text-xs text-gray-500">
              {itemCount === 1 ? '1 item' : `${itemCount} items`}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close cart"
            onClick={() => dispatch(closeCart())}
            className="rounded-xl border border-gray-100 bg-gray-50 p-2 text-gray-500 transition hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <CartList />
        </div>

        <div className="border-t border-gray-100 p-5">
          <Link
            to="/checkout"
            onClick={() => dispatch(closeCart())}
            className="flex h-12 items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 active:scale-95"
          >
            Check Out
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default CartSidebar
