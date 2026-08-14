import './App.css'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import CheckOut from './pages/CheckOut'
import Navbar from './components/Navbar'
import Product from './pages/Product'
import CartSidebar from './features/cart/CartSidebar'
import {
  fetchCurrentUser,
  selectAuthToken,
  selectCurrentUser,
  selectSessionStatus,
} from './features/users/usersSlice'
import UserAccount from './pages/UserAccount'

function App() {
  const dispatch = useDispatch()
  const token = useSelector(selectAuthToken)
  const currentUser = useSelector(selectCurrentUser)
  const sessionStatus = useSelector(selectSessionStatus)

  useEffect(() => {
    if (token && !currentUser && sessionStatus === 'idle') {
      dispatch(fetchCurrentUser())
    }
  }, [currentUser, dispatch, sessionStatus, token])

  const isRestoringSession = Boolean(
    token
    && !currentUser
    && (sessionStatus === 'idle' || sessionStatus === 'loading')
  )

  if (isRestoringSession) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-medium text-gray-500"
        role="status"
      >
        Restoring your session...
      </div>
    )
  }

  return (
    <>
    <header>
      <Navbar/>
    </header>
    <main className="app-main">
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/auth' element={<Auth/>}/>
        <Route path='/checkout' element={<CheckOut/>}/>
        <Route path='/product/:id' element={<Product/>} />
        <Route path='/account' element={<UserAccount/>} />
      </Routes>
    </main>
      <CartSidebar />
    </>
  )
}

export default App
