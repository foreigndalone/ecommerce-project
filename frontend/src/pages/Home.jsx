import { useSelector } from 'react-redux'
import CartList from '../features/cart/CartList.jsx'
import ProductFilter from '../features/products/ProductFilter.jsx'
import ProductList from '../features/products/ProductList.jsx'

export default function Home() {

  const showCart = useSelector(state=>state.cartReducer.showCart)
  
  return (
    <div>
      {showCart && <CartList />}

      <ProductFilter />
      <ProductList />
    </div>
  )
}
