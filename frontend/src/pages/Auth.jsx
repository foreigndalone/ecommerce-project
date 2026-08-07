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
    <div className="min-h-[calc(100svh-73px)] bg-gray-50 px-4 py-10 sm:px-6 lg:flex lg:items-center lg:py-14">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-amber-500 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border-[40px] border-white/10" />

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-amber-100">
              Shop By
            </p>
            <h2 className="mt-3 max-w-sm text-4xl font-black leading-tight tracking-tight text-white">
              Everything you love, all in one place.
            </h2>
          </div>

          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm leading-relaxed text-amber-50">
              {mode === 'signup'
                ? 'Create an account to enjoy a faster checkout and keep your shopping experience personal.'
                : 'Welcome back. Sign in to continue shopping and access your account.'}
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 lg:hidden">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-amber-600">
              {mode === 'signup' ? 'Join Shop By' : 'Welcome back'}
            </p>
            <h1 className="m-0 mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {mode === 'signup' ? 'Sign Up' : 'Login'}
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              {mode === 'signup'
                ? 'Enter your details below to get started.'
                : 'Enter your details to continue shopping.'}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            {mode === 'signup' && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="name">
                  Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                  <input
                    className={`h-12 w-full rounded-xl border bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 ${errors.name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-100 focus:border-amber-500 focus:ring-amber-100'}`}
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
                {errors.name && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  className={`h-12 w-full rounded-xl border bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 ${errors.email ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-100 focus:border-amber-500 focus:ring-amber-100'}`}
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
              {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  className={`h-12 w-full rounded-xl border bg-gray-50 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:bg-white focus:ring-2 ${errors.password ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-gray-100 focus:border-amber-500 focus:ring-amber-100'}`}
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
              {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>}
            </div>

            {hasError && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700" role="alert">
                {errorMessage}
              </div>
            )}

            <button
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-amber-300"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : mode === 'signup' ? 'Sign Up' : 'Login'}
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>

            <p className="text-center text-sm text-gray-500">
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="font-bold text-amber-600 transition-colors hover:text-amber-700 focus:outline-none focus-visible:rounded focus-visible:ring-2 focus-visible:ring-amber-500"
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
