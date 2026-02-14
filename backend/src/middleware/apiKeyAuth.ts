import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey.model';
import { hashApiKey } from '../utils/apiKeyUtils';
import logger from '../utils/logger';

export interface ApiKeyRequest extends Request {
    apiKey?: {
        keyId: string;
        customerId: string;
        apiKeyId: string;
        environment: string;
        plan: string;
        rateLimit: number;
    };
}



/**
 * Middleware: Authenticate requests using API key in Bearer header.
 * Extracts key, hashes it, looks up in DB, checks status.
 */
export const authenticateApiKey = async (
    req: ApiKeyRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'unauthorized',
                message: 'Missing or invalid Authorization header. Use: Bearer hv_live_XXXX',
            });
            return;
        }

        const rawKey = authHeader.split(' ')[1];
        if (!rawKey || !rawKey.startsWith('ak_')) {
            res.status(401).json({
                error: 'invalid_key_format',
                message: 'API key must start with ak_',
            });
            return;
        }

        const keyHash = hashApiKey(rawKey);
        const apiKey = await ApiKey.findOne({ keyHash });

        if (!apiKey) {
            logger.warn('Invalid API key attempt', {
                prefix: rawKey.substring(0, 10),
                length: rawKey.length
            });
            res.status(401).json({
                error: 'invalid_key',
                message: 'API key not found',
            });
            return;
        }

        if (apiKey.status !== 'active') {
            res.status(403).json({
                error: 'key_inactive',
                message: `API key is ${apiKey.status}`,
            });
            return;
        }

        // Update last used + daily usage
        const today = new Date().toISOString().split('T')[0];
        if (apiKey.dailyUsageDate !== today) {
            apiKey.dailyUsage = 0;
            apiKey.dailyUsageDate = today;
        }
        apiKey.dailyUsage += 1;
        apiKey.monthlyUsage += 1;
        apiKey.lastUsedAt = new Date();
        await apiKey.save();

        // Attach context
        req.apiKey = {
            keyId: apiKey.keyId,
            customerId: apiKey.customerId.toString(),
            apiKeyId: apiKey._id.toString(),
            environment: apiKey.environment,
            plan: apiKey.plan,
            rateLimit: apiKey.rateLimit,
        };

        next();
    } catch (error) {
        logger.error('API key auth error:', error);
        res.status(500).json({
            error: 'server_error',
            message: 'Authentication failed',
        });
    }
};

/**
 * Middleware: Authenticates via API Key OR User Token (JWT).
 * If User Token is provided, it finds an active API key for the user and attaches it.
 */
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export const authenticateApiKeyOrUser = async (
    req: ApiKeyRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                error: 'unauthorized',
                message: 'Missing or invalid Authorization header.',
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // 1. Try as API Key
        if (token.startsWith('ak_')) {
            return authenticateApiKey(req, res, next);
        }

        // 2. Try as User Token (JWT)
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            if (!decoded.userId) throw new Error('Invalid token');

            // Find an active API key for this user
            const apiKey = await ApiKey.findOne({
                customerId: decoded.userId,
                status: 'active'
            }).sort({ createdAt: -1 });

            if (!apiKey) {
                res.status(403).json({
                    error: 'no_api_key',
                    message: 'No active API key found. Please create one in the dashboard settings first.',
                });
                return;
            }

            // Update usage stats (optional for internal dashboard use, but good for tracking)
            const today = new Date().toISOString().split('T')[0];
            if (apiKey.dailyUsageDate !== today) {
                apiKey.dailyUsage = 0;
                apiKey.dailyUsageDate = today;
            }
            // We might strictly NOT want to count dashboard usage against limits, but for now let's count it or just skip saving?
            // Let's count it to be safe.
            apiKey.dailyUsage += 1;
            apiKey.monthlyUsage += 1;
            apiKey.lastUsedAt = new Date();
            await apiKey.save();

            // Attach context
            req.apiKey = {
                keyId: apiKey.keyId,
                customerId: apiKey.customerId.toString(),
                apiKeyId: apiKey._id.toString(),
                environment: apiKey.environment,
                plan: apiKey.plan,
                rateLimit: apiKey.rateLimit,
            };

            next();
        } catch (jwtError) {
            res.status(401).json({
                error: 'unauthorized',
                message: 'Invalid or expired token',
            });
            return;
        }

    } catch (error) {
        logger.error('Hybrid auth error:', error);
        res.status(500).json({ error: 'server_error', message: 'Authentication failed' });
    }
};
