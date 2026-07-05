import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export default function Auth() {
  const [mode, setMode] = useState('signup')
  const {register, handleSubmit, formState: {errors},} = useForm()

  const onSubmit = () => {
    alert('sign up')
  }
  return (
    <div>
      <form action="" onSubmit={handleSubmit(onSubmit)}>

      <div>
        <h1>{mode === 'signup' ? 'Sign Up' : 'Login'}</h1>

        <label htmlFor="email">Email</label>
        <input type="text" id='email' placeholder='Email' {...register('email', {required: 'Email is required', 
          minLength: {
            value: 6,
            message: 'Email must have 6 characters'
          }
        })}/>
        {errors.email && <span>{errors.email.message}</span>}

      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="text" id='password' placeholder='Password' {...register('password', {required: 'Password is required',
          minLength: {
            value: 4,
            message: 'Password has to include more then 4 characters'
          },
          maxLength: {
            value: 12, 
            message: 'Password has to include less then 12 characters'
          }
        })}/>
        {errors.password && <span>{errors.password.message}</span>}
        
      </div>
      <button>{mode === 'signup' ? 'Sign Up' : 'Login'}</button>

      {mode === 'signup'?(
        <p>Already have an account? <span onClick={()=>setMode('login')}>Login</span></p>
      ):(
        <p>Don't have an account? <span onClick={()=>setMode('signup')}>Sign Up</span></p>
      )}
      
    </form>
    </div>
  )
}
