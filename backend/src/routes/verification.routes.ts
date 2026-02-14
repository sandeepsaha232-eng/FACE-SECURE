import { Router } from 'express';
import { createSession, getSession, completeSession } from '../controllers/verification.controller';
import { authenticateApiKeyOrUser } from '../middleware/apiKeyAuth';

const router = Router();

// All routes require API key OR User Token (with active API key) authentication
router.use(authenticateApiKeyOrUser);

// POST /v1/verification/session — Create a verification session
router.post('/session', createSession);

// GET /v1/verification/session/:id — Get session result
router.get('/session/:id', getSession);

// POST /v1/verification/session/:id/complete — Complete a session (internal)
router.post('/session/:id/complete', completeSession);

export default router;
