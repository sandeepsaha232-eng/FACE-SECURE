import { Router } from 'express';
import { verifyFace, register, login, submitVerification } from '../controllers/auth.controller';
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

router.post('/verify-face', faceVerificationLimiter, verifyFace);

/**
 * POST /api/auth/submit-verification
 * Submit a liveness verification result
 */
router.post('/submit-verification', submitVerification);

export default router;
