import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { sendUserData } from '../features/users/usersSlice.js' // Укажите правильный путь к вашему слейсу

export default function Auth() {
  const [mode, setMode] = useState('signup')
  
  const dispatch = useDispatch()
  const { isLoading, hasError, errorMessage } = useSelector((state) => state.usersReducer)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = (formData) => {
    if (mode === 'signup') {
      // forms User's data
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(), // sends current rime
      }

      dispatch(sendUserData(payload))
    } else {
      // Logic for Login 
      console.log('Login attempt:', formData)
    }
  }

  // Reset the form while toggling between modes
  const toggleMode = (newMode) => {
    setMode(newMode)
    reset()
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <h1>{mode === 'signup' ? 'Sign Up' : 'Login'}</h1>

          {/* Поле Name показываем только при регистрации */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Name"
                {...register('name', {
                  required: mode === 'signup' ? 'Name is required' : false,
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                })}
              />
              {errors.name && <span style={{ color: 'red' }}>{errors.name.message}</span>}
            </div>
          )}

          {/* Поле Email */}
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Enter a valid email address',
                },
              })}
            />
            {errors.email && <span style={{ color: 'red' }}>{errors.email.message}</span>}
          </div>

          {/* Поле Password */}
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 4,
                  message: 'Password has to include more than 4 characters',
                },
                maxLength: {
                  value: 12,
                  message: 'Password has to include less than 12 characters',
                },
              })}
            />
            {errors.password && <span style={{ color: 'red' }}>{errors.password.message}</span>}
          </div>
        </div>

        {/* Отображаем ошибку от сервера, если запрос упал */}
        {hasError && <p style={{ color: 'red' }}>{errorMessage}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : mode === 'signup' ? 'Sign Up' : 'Login'}
        </button>

        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => toggleMode('login')}>
              Login
            </span>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => toggleMode('signup')}>
              Sign Up
            </span>
          </p>
        )}
      </form>
    </div>
  )
}