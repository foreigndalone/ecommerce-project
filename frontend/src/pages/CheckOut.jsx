import { useEffect } from 'react'
import CartList from '../features/cart/CartList'
import { useDispatch, useSelector } from 'react-redux'
import { selectCartItems, selectCartTotal } from '../features/cart/cartSlice'
import { fetchProductsThunk } from '../features/products/productsSlice'

export default function CheckOut() {
  const dispatch = useDispatch()
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
    <div>
      <h1>CheckOut</h1>
      <CartList/>
      <h2 >
        Total Price: ${finalPrice.toFixed(2)}
      </h2>

     <button
          onClick={handlePlaceOrder}
          disabled={cart.length === 0}
          className={`flex h-12 items-center justify-center gap-2 rounded-xl px-8 text-sm font-bold transition-all duration-300 ${
            cart.length === 0
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow active:scale-95 active:bg-amber-700'
          }`}
        >
          <span>{cart.length === 0 ? 'Fill the cart' : 'Place Order'}</span>
        </button>
    </div>
  )
}
