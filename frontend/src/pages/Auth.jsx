import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  clearAuthError,
  login,
  sendUserData,
} from '../features/users/usersSlice.js'

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mode, setMode] = useState(
    searchParams.get('mode') === 'login' ? 'login' : 'signup'
  )
  const dispatch = useDispatch()
  const { isLoading, hasError, errorMessage } = useSelector((state) => state.usersReducer)

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (formData) => {
    try {
      if (mode === 'signup') {
        await dispatch(sendUserData({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString(),
        })).unwrap()
      } else {
        await dispatch(login({
          email: formData.email,
          password: formData.password,
        })).unwrap()
      }

      navigate('/')
    } catch {
      // The rejected thunk stores the server message in the users slice.
    }
  }

  const toggleMode = (newMode) => {
    setMode(newMode)
    setSearchParams(newMode === 'login' ? { mode: 'login' } : {}, { replace: true })
    dispatch(clearAuthError())
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
                    message: 'Password must contain at least 4 characters',
                  },
                  maxLength: {
                    value: 12,
                    message: 'Password must contain at most 12 characters',
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
            <button type="button" onClick={() => toggleMode('login')}>
              Login
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={() => toggleMode('signup')}>
              Sign Up
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
