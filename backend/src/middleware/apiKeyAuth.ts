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
