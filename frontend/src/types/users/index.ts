export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role?: UserRole
  points?: number
  balance?: number
  avatar?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AuthResponse {
  user: User
  token: string
}

export interface RegisterUserPayload {
  name: string
  email: string
  password: string
  createdAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateUserPayload {
  name?: string
  email?: string
}

export type SessionStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'failed'

export type ProfileUpdateStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface AuthErrorPayload {
  status: number | null
  message: string
}

export interface UsersState {
  currentUser: User | null
  token: string | null
  sessionStatus: SessionStatus
  isLoading: boolean
  hasError: boolean
  errorMessage: string | null
  profileUpdateStatus: ProfileUpdateStatus
  profileUpdateError: string | null
}
