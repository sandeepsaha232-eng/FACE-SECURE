import { Router } from 'express';
import {
    createApiKey,
    listApiKeys,
    updateApiKey,
    rotateApiKey,
    disableApiKey,
    getKeyUsage,
    getAnalytics,
} from '../controllers/apiKey.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// CRITICAL: All routes in this file MUST require JWT authentication (authenticateToken).
// NEVER use authenticateApiKey (API key auth) here, as that would create a paradox 
// where a user needs an API key to create their first API key.
router.use(authenticateToken);

// POST /api/keys — Create a new API key
router.post('/', createApiKey);

// GET /api/keys — List all API keys
router.get('/', listApiKeys);

// GET /api/keys/analytics — Aggregate analytics
router.get('/analytics', getAnalytics);

// PUT /api/keys/:id — Update API key settings
router.put('/:id', updateApiKey);

// POST /api/keys/:id/rotate — Rotate an API key
router.post('/:id/rotate', rotateApiKey);

// POST /api/keys/:id/disable — Toggle suspend an API key
router.post('/:id/disable', disableApiKey);

// GET /api/keys/:id/usage — Get usage stats
router.get('/:id/usage', getKeyUsage);

export default router;
