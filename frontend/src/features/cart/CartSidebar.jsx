import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import CartList from './CartList'
import { closeCart, selectCartItemCount, selectCartTotal, selectShowCart } from './cartSlice'

const CartSidebar = () => {
  const dispatch = useDispatch()
  const showCart = useSelector(selectShowCart)
  const itemCount = useSelector(selectCartItemCount)
  const total = useSelector(selectCartTotal)

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
        className={`cart-backdrop ${
          showCart ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        className={`cart-drawer ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className="cart-drawer-head">
          <div>
            <p className="section-kicker">Current selection</p>
            <h2 id="cart-sidebar-title" className="cart-drawer-title">Your cart</h2>
            <p className="cart-drawer-count">
              {itemCount === 1 ? '1 item' : `${itemCount} items`}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close cart"
            onClick={() => dispatch(closeCart())}
            className="cart-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="cart-drawer-body">
          <CartList />
        </div>

        <div className="cart-drawer-foot">
          <div className="cart-drawer-total"><span>Total</span><strong>${total.toFixed(2)}</strong></div>
          <Link
            to="/checkout"
            onClick={() => dispatch(closeCart())}
            className="primary-button cart-checkout-link"
          >
            Check Out
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default CartSidebar
