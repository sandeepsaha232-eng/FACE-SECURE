import { Router } from 'express';
import { getStats } from '../controllers/stats.controller';

const router = Router();

/**
 * GET /api/stats
 * Get real-time system statistics and logs
 */
router.get('/', getStats);

export default router;
