import Navbar from '../components/Navbar.jsx'
import ProductFilter from '../features/products/ProductFilter.jsx'
import ProductList from '../features/products/ProductList.jsx'

export default function Home() {


  return (
    <div>
      <ProductFilter/>
      <ProductList/>
    </div>
  )
}
