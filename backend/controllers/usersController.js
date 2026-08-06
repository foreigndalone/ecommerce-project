// path: src/controllers/usersController.js
import { authenticateUserModel, createUserModel } from '../models/usersModels.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getCredentials = (body = {}, includeName = false) => {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if ((includeName && !name) || !EMAIL_PATTERN.test(email) || !password) {
        return null
    }

    return includeName ? { name, email, password } : { email, password }
}

export const registerUser = async (req, res) => {
    const registration = getCredentials(req.body, true)

    if (!registration) {
        return res.status(400).json({ message: 'Valid name, email, and password are required' })
    }

    try {
        const user = await createUserModel(registration)

        return res.status(201).json(user)
    } catch (error) {
        console.error('Registration error:', error)

        if (error?.code === 11000) {
            return res.status(409).json({ message: 'A user with this email already exists' })
        }

        return res.status(500).json({ message: 'Ошибка при создании пользователя' })
    }
}

export const loginUser = async (req, res) => {
    const credentials = getCredentials(req.body)

    if (!credentials) {
        return res.status(400).json({ message: 'Valid email and password are required' })
    }

    try {
        const user = await authenticateUserModel(credentials)

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        return res.json(user)
    } catch (error) {
        console.error('Login error:', error)
        return res.status(500).json({ message: 'Ошибка при входе пользователя' })
    }
}
