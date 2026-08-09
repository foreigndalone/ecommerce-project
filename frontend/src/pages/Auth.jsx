import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail, ShoppingBag, User } from 'lucide-react'
import {
  clearAuthError,
  login,
  sendUserData,
} from '../features/users/usersSlice.js'

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') === 'login' ? 'login' : 'signup'
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

        await dispatch(login({
          email: formData.email,
          password: formData.password,
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
    setSearchParams({ mode: newMode }, { replace: true })
    dispatch(clearAuthError())
    reset()
  }

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-story">
          <div>
            <div className="auth-mark">
              <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="auth-story-label">ShopBy member counter</p>
            <h2 className="auth-story-title">Your shop,<br /><span>ready when you are.</span></h2>
          </div>
          <div className="auth-story-note">
            <p>
              {mode === 'signup'
                ? 'Create an account to enjoy a faster checkout and keep your shopping experience personal.'
                : 'Welcome back. Sign in to continue shopping and access your account.'}
            </p>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-heading">
            <div className="auth-mobile-mark">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="section-kicker">
              {mode === 'signup' ? 'Join Shop By' : 'Welcome back'}
            </p>
            <h1 className="auth-title">
              {mode === 'signup' ? 'Sign Up' : 'Login'}
            </h1>
            <p className="auth-intro">
              {mode === 'signup'
                ? 'Enter your details below to get started.'
                : 'Enter your details to continue shopping.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {mode === 'signup' && (
              <div className="form-field">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <div className="relative">
                  <User className="form-icon" aria-hidden="true" />
                  <input
                    className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                    type="text"
                    id="name"
                    placeholder="Your name"
                    autoComplete="name"
                    {...register('name', {
                      required: mode === 'signup' ? 'Name is required' : false,
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                  />
                </div>
                {errors.name && <p className="form-error" role="alert">{errors.name.message}</p>}
              </div>
            )}

            <div className="form-field">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="form-icon" aria-hidden="true" />
                <input
                  className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && <p className="form-error" role="alert">{errors.email.message}</p>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="form-icon" aria-hidden="true" />
                <input
                  className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                  type="password"
                  id="password"
                  placeholder="4–12 characters"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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
              </div>
              {errors.password && <p className="form-error" role="alert">{errors.password.message}</p>}
            </div>

            {hasError && (
              <div className="form-server-error" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              className="primary-button auth-submit"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : mode === 'signup' ? 'Sign Up' : 'Login'}
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>

            <p className="auth-switch">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="text-button"
                type="button"
                onClick={() => toggleMode(mode === 'signup' ? 'login' : 'signup')}
              >
                {mode === 'signup' ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </form>
        </div>
      </section>
    </div>
  )
}
