import {
    authenticateUserModel,
    createUserModel,
    findUserByIdModel,
} from '../models/usersModel.js'
import { createJwtToken, normalizeEmail } from '../utils/usersAuth.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getRegistrationData = (data = {}) => {
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    const email = typeof data.email === 'string' ? normalizeEmail(data.email) : ''
    const password = typeof data.password === 'string' ? data.password : ''

    if (!name || !EMAIL_PATTERN.test(email) || !password.trim()) {
        return null
    }

    const requestedCreatedAt = new Date(data.createdAt)
    const createdAt = data.createdAt && !Number.isNaN(requestedCreatedAt.getTime())
        ? requestedCreatedAt
        : new Date()

    return { name, email, password, createdAt }
}

const getLoginData = (data = {}) => {
    const email = typeof data.email === 'string' ? normalizeEmail(data.email) : ''
    const password = typeof data.password === 'string' ? data.password : ''

    if (!EMAIL_PATTERN.test(email) || !password.trim()) {
        return null
    }

    return { email, password }
}

export const createUsersController = ({
    createUser = createUserModel,
    authenticateUser = authenticateUserModel,
    findUserById = findUserByIdModel,
    createToken = createJwtToken,
} = {}) => {
    const registerUser = async (req, res) => {
        const userData = getRegistrationData(req.body)

        if (!userData) {
            return res.status(400).json({
                message: 'Name, email, and password are required',
            })
        }

        try {
            const user = await createUser(userData)

            return res.status(201).json(user)
        } catch (error) {
            console.error('Registration error:', error)

            if (error?.code === 11000) {
                return res.status(409).json({
                    message: 'A user with this email already exists',
                })
            }

            return res.status(500).json({ message: 'Failed to create user' })
        }
    }

    const loginUser = async (req, res) => {
        const credentials = getLoginData(req.body)

        if (!credentials) {
            return res.status(400).json({
                message: 'Email and password are required',
            })
        }

        try {
            const user = await authenticateUser(credentials)

            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' })
            }

            const token = createToken(user)

            return res.status(200).json({ user, token })
        } catch (error) {
            console.error('Login error:', error)
            return res.status(500).json({ message: 'Failed to log in' })
        }
    }

    const getCurrentUser = async (req, res) => {
        try {
            const user = await findUserById(req.user.sub)

            if (!user) {
                return res.status(404).json({ message: 'User not found' })
            }

            return res.status(200).json(user)
        } catch (error) {
            console.error('Get current user error:', error)
            return res.status(500).json({ message: 'Failed to get user' })
        }
    }

    return { getCurrentUser, loginUser, registerUser }
}

export const { getCurrentUser, loginUser, registerUser } = createUsersController()
