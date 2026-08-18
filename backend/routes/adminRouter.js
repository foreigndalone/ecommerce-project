import { Router } from 'express'

import {
    archiveProductController,
    createProductController,
    updateProductController,
} from '../controllers/adminController.js'
import {
    requireAuth,
    requireRole,
} from '../src/middlewares/auth.middleware.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('admin'))

router.post('/products', createProductController)
router.patch('/products/:id', updateProductController)
router.delete('/products/:id', archiveProductController)

export default router
