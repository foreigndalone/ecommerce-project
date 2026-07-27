import './App.css'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CheckOut from './pages/CheckOut'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
    <header>
      <Navbar/>
    </header>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/checkout' element={<CheckOut/>}/>
      </Routes>
    </>
  )
}

export default App
