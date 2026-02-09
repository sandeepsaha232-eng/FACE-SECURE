import { Router } from 'express';
import { verifyFace, register, login } from '../controllers/auth.controller';
import { faceVerificationLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user (with optional face embedding)
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', login);

/**
 * POST /api/auth/verify-face
 * Verify face and authenticate user
 */
router.post('/verify-face', faceVerificationLimiter, verifyFace);

export default router;
