import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * GET /api/stats
 * Get real-time system statistics and logs
 */
router.get('/', authenticateToken, getStats);

export default router;
