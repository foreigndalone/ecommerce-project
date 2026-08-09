import { Router } from 'express'
import {
    getCurrentUser,
    loginUser,
    registerUser,
} from '../controllers/usersController.js'
import requireAuth from '../src/middlewares/auth.middleware.js'

const router = Router()

router.get('/me', requireAuth, getCurrentUser)
router.post('/signUp', registerUser)
router.post('/login', loginUser)

export default router
