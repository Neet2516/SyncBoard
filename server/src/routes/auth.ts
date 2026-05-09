import { Router } from 'express'
import { authController } from '../controllers/authController'
import { authMiddleware } from '../middleware/authMiddleware'
import { createRateLimitMiddleware } from '../middleware/rateLimitMiddleware'

const router = Router()

router.post('/register', createRateLimitMiddleware('register'), authController.register)
router.post('/login', createRateLimitMiddleware('login'), authController.login)
router.post('/logout', authController.logout)
router.get('/me', authMiddleware, authController.me)

export default router
