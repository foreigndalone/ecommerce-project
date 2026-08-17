import type { ObjectId } from 'mongodb'

export type UserRole = 'user' | 'admin'

export interface UserDocument {
  _id: ObjectId
  name: string
  normalizedEmail: string
  passwordHash: string
  role?: UserRole
  points?: number
  balance?: number
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role?: UserRole
  points?: number
  balance?: number
  avatar?: string
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface RegisterUserData {
  name: string
  email: string
  password: string
  createdAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface UserUpdates {
  name?: string
  email?: string
}
