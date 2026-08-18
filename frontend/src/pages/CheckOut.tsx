import { useEffect } from 'react'
import CartList from '../features/cart/CartList'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItems, selectCartTotal } from '../features/cart/cartSlice'
import { fetchProductsThunk } from '../features/products/productsSlice'
import type { AppDispatch } from '../app/store'

export default function CheckOut() {
  const dispatch = useDispatch<AppDispatch>()
  const cart = useSelector(selectCartItems)
  const finalPrice = useSelector(selectCartTotal)

  useEffect(() => {
    dispatch(fetchProductsThunk())
  }, [dispatch])

  const handlePlaceOrder = () => {
    if (cart.length === 0) return
    alert('Order placed successfully!')
  }

  return (
    <div className="checkout-page">
      <div className="shop-shell">
        <header className="checkout-heading">
          <p className="section-kicker">Final review</p>
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-intro">Review your items before placing the order.</p>
        </header>
        <div className="checkout-grid">
          <section className="checkout-items" aria-labelledby="order-items-title">
            <div className="checkout-section-head">
              <h2 id="order-items-title">Your items</h2>
              <span>{cart.length} {cart.length === 1 ? 'line' : 'lines'}</span>
            </div>
            <CartList/>
          </section>
          <aside className="order-summary" aria-labelledby="order-summary-title">
            <p className="section-kicker">Order summary</p>
            <h2 id="order-summary-title" className="summary-title">Ready to place</h2>
            <div className="summary-row"><span>Items</span><span>{cart.length}</span></div>
            <div className="summary-total">
              <span>Total Price: ${finalPrice.toFixed(2)}</span>
            </div>
            <p className="summary-note">Taxes and delivery are calculated when the order is processed.</p>
            <button
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
          className="primary-button checkout-button"
        >
          <span>{cart.length === 0 ? 'Fill the cart' : 'Place Order'}</span>
        </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
