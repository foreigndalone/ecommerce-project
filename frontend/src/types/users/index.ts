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
