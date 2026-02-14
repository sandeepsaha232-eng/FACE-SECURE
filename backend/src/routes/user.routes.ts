import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes are protected by JWT authentication
router.use(authenticateToken);

// GET /api/user/profile
router.get('/profile', getProfile);

// PUT /api/user/profile
router.put('/profile', updateProfile);

export default router;
