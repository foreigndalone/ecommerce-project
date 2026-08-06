import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CheckOut from './pages/CheckOut'
import Navbar from './components/Navbar'
import Product from './pages/Product'
import CartSidebar from './features/cart/CartSidebar'

function App() {

  return (
    <>
    <header>
      <Navbar/>
    </header>
    <main className="pt-[73px]">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/checkout' element={<CheckOut/>}/>
        <Route path='/product/:id' element={<Product/>} />
      </Routes>
    </main>
      <CartSidebar />
    </>
  )
}

export default App
