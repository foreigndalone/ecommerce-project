import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
        <nav className='navbar'>
            <div className='navbar-container'>
                <Link to='/' className='navbar-brand'>Shop By</Link>
                <div className='navbar-links'>
                    <Link to='/'>Home</Link>
                    <Link to='/checkout'>Cart</Link>
                </div>
                <div className='navbar-auth'>
                    <Link to='/auth'>Sign Up</Link>
                    <Link to='/auth'>Log Out</Link>
                </div>
            </div>
        </nav>
  )
}
