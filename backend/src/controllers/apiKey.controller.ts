import { Response } from 'express';
import crypto from 'crypto';
import { ApiKey } from '../models/ApiKey.model';
import { VerificationSession } from '../models/VerificationSession.model';
import { hashApiKey, generateApiKey } from '../utils/apiKeyUtils';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

function generateWebhookSecret(): string {
    return `whsec_${crypto.randomBytes(24).toString('hex')}`;
}

/**
 * POST /api/keys — Create a new API key
 */
export const createApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    // Assert Auth Invariant: This route MUST be protected by JWT auth
    if (!req.user || !req.user.userId) {
        logger.error('Structural Auth Failure: createApiKey called without req.user context. Check middleware order in routes.', {
            path: req.path,
            hasUser: !!req.user
        });
        res.status(401).json({
            success: false,
            error: 'unauthorized',
            message: 'User authentication required for this action'
        });
        return;
    }

    try {
        const userId = req.user.userId;
        const { name, environment } = req.body;
        const env = environment === 'test' ? 'test' : 'live';

        logger.debug('Generating API key...', { env, name });
        const { rawKey, keyId, keyHash } = generateApiKey(env);
        const keyPrefix = rawKey.substring(0, 12) + '...';
        logger.debug('Key generated', { keyId, keyPrefix });

        const apiKey = new ApiKey({
            keyId,
            keyHash,
            keyPrefix,
            name: name || 'My API Key',
            customerId: userId,
            environment: env,
            status: 'active',
            webhookSecret: generateWebhookSecret(),
        });

        logger.debug('Saving API key to database...', { keyId });
        await apiKey.save();

        logger.info(`API key created: ${keyId} for user ${userId} in ${env} environment`);

        // Return the full key ONLY once
        res.status(201).json({
            success: true,
            message: 'API key created. Save this key — it will not be shown again.',
            data: {
                id: apiKey._id,
                keyId: apiKey.keyId,
                key: rawKey, // Only time we return the full key
                keyPrefix: apiKey.keyPrefix,
                name: apiKey.name,
                environment: apiKey.environment,
                status: apiKey.status,
                createdAt: apiKey.createdAt,
            },
        });
    } catch (error: any) {
        logger.error('Create API key error:', error);
        res.status(500).json({ success: false, message: 'Failed to create API key' });
    }
};

/**
 * GET /api/keys — List all API keys for current user
 */
export const listApiKeys = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        const keys = await ApiKey.find({ customerId: userId })
            .select('-keyHash')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: keys.map((k) => ({
                id: k._id,
                keyId: k.keyId,
                keyPrefix: k.keyPrefix,
                name: k.name,
                environment: k.environment,
                status: k.status,
                monthlyUsage: k.monthlyUsage,
                dailyUsage: k.dailyUsage,
                successCount: k.successCount,
                failureCount: k.failureCount,
                lastUsedAt: k.lastUsedAt,
                createdAt: k.createdAt,
                webhookUrl: k.webhookUrl,
                webhookRetryPolicy: k.webhookRetryPolicy,
                webhookLastDelivery: k.webhookLastDelivery,
                webhookSecret: k.webhookSecret ? `whsec_${'*'.repeat(12)}` : undefined,
                dataRetention: k.dataRetention,
                disableVideoStorage: k.disableVideoStorage,
                requireExtraVerification: k.requireExtraVerification,
            })),
        });
    } catch (error: any) {
        logger.error('List API keys error:', error);
        res.status(500).json({ success: false, message: 'Failed to list API keys' });
    }
};

/**
 * PUT /api/keys/:id — Update API key settings
 */
export const updateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const updates = req.body;

        const apiKey = await ApiKey.findOne({ _id: id, customerId: userId });
        if (!apiKey) {
            res.status(404).json({ success: false, message: 'API key not found' });
            return;
        }

        // Allowed updates
        const allowedFields = [
            'name', 'webhookUrl', 'webhookRetryPolicy',
            'dataRetention', 'disableVideoStorage', 'requireExtraVerification',
        ];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                (apiKey as any)[field] = updates[field];
            }
        }

        await apiKey.save();

        res.status(200).json({
            success: true,
            message: 'API key updated',
            data: { id: apiKey._id, name: apiKey.name },
        });
    } catch (error: any) {
        logger.error('Update API key error:', error);
        res.status(500).json({ success: false, message: 'Failed to update API key' });
    }
};

/**
 * POST /api/keys/:id/rotate — Rotate (revoke old, create new)
 */
export const rotateApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const oldKey = await ApiKey.findOne({ _id: id, customerId: userId });
        if (!oldKey) {
            res.status(404).json({ success: false, message: 'API key not found' });
            return;
        }

        // Revoke old key
        oldKey.status = 'revoked';
        await oldKey.save();

        // Generate new key
        const { rawKey, keyId, keyHash } = generateApiKey(oldKey.environment);
        const keyPrefix = rawKey.substring(0, 12) + '...';

        const newApiKey = new ApiKey({
            keyId,
            keyHash,
            keyPrefix,
            name: oldKey.name,
            customerId: userId,
            environment: oldKey.environment,
            status: 'active',
            webhookUrl: oldKey.webhookUrl,
            webhookSecret: oldKey.webhookSecret,
            webhookRetryPolicy: oldKey.webhookRetryPolicy,
            dataRetention: oldKey.dataRetention,
            disableVideoStorage: oldKey.disableVideoStorage,
            requireExtraVerification: oldKey.requireExtraVerification,
        });

        await newApiKey.save();

        logger.info(`API key rotated: ${oldKey.keyId} → ${keyId}`);

        res.status(201).json({
            success: true,
            message: 'API key rotated. Old key revoked. Save the new key — it will not be shown again.',
            data: {
                id: newApiKey._id,
                keyId: newApiKey.keyId,
                key: rawKey,
                keyPrefix: newApiKey.keyPrefix,
                name: newApiKey.name,
                environment: newApiKey.environment,
                status: newApiKey.status,
                createdAt: newApiKey.createdAt,
            },
        });
    } catch (error: any) {
        logger.error('Rotate API key error:', error);
        res.status(500).json({ success: false, message: 'Failed to rotate API key' });
    }
};

/**
 * POST /api/keys/:id/disable — Suspend an API key
 */
export const disableApiKey = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const apiKey = await ApiKey.findOne({ _id: id, customerId: userId });
        if (!apiKey) {
            res.status(404).json({ success: false, message: 'API key not found' });
            return;
        }

        apiKey.status = apiKey.status === 'suspended' ? 'active' : 'suspended';
        await apiKey.save();

        res.status(200).json({
            success: true,
            message: `API key ${apiKey.status}`,
            data: { id: apiKey._id, status: apiKey.status },
        });
    } catch (error: any) {
        logger.error('Disable API key error:', error);
        res.status(500).json({ success: false, message: 'Failed to disable API key' });
    }
};

/**
 * GET /api/keys/:id/usage — Get usage stats for a specific key
 */
export const getKeyUsage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const apiKey = await ApiKey.findOne({ _id: id, customerId: userId });
        if (!apiKey) {
            res.status(404).json({ success: false, message: 'API key not found' });
            return;
        }

        // Get session stats for this key
        const totalSessions = await VerificationSession.countDocuments({ apiKeyId: apiKey._id });
        const verifiedSessions = await VerificationSession.countDocuments({ apiKeyId: apiKey._id, status: 'verified' });
        const rejectedSessions = await VerificationSession.countDocuments({ apiKeyId: apiKey._id, status: 'rejected' });
        const pendingSessions = await VerificationSession.countDocuments({ apiKeyId: apiKey._id, status: 'pending' });

        // Recent sessions
        const recentSessions = await VerificationSession.find({ apiKeyId: apiKey._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('sessionId status confidence signals deviceInfo ipAddress location isEncrypted createdAt completedAt');

        // Average confidence
        const avgResult = await VerificationSession.aggregate([
            { $match: { apiKeyId: apiKey._id, status: 'verified' } },
            { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
        ]);
        const avgConfidence = avgResult[0]?.avgConfidence || 0;

        res.status(200).json({
            success: true,
            data: {
                keyId: apiKey.keyId,
                name: apiKey.name,
                dailyUsage: apiKey.dailyUsage,
                monthlyUsage: apiKey.monthlyUsage,
                totalSessions,
                verifiedSessions,
                rejectedSessions,
                pendingSessions,
                successRate: totalSessions > 0 ? Math.round((verifiedSessions / totalSessions) * 100) : 0,
                avgConfidence: Math.round(avgConfidence),
                recentSessions,
            },
        });
    } catch (error: any) {
        logger.error('Get key usage error:', error);
        res.status(500).json({ success: false, message: 'Failed to get key usage' });
    }
};

/**
 * GET /api/keys/analytics — Aggregate analytics across all keys for dashboard
 */
export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // Get all key IDs for this user
        const userKeys = await ApiKey.find({ customerId: userId }).select('_id');
        const keyIds = userKeys.map((k) => k._id);

        const totalVerifications = await VerificationSession.countDocuments({ apiKeyId: { $in: keyIds } });
        const verifiedCount = await VerificationSession.countDocuments({ apiKeyId: { $in: keyIds }, status: 'verified' });
        const rejectedCount = await VerificationSession.countDocuments({ apiKeyId: { $in: keyIds }, status: 'rejected' });

        // Average confidence
        const avgResult = await VerificationSession.aggregate([
            { $match: { apiKeyId: { $in: keyIds }, status: 'verified' } },
            { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
        ]);
        const avgConfidence = avgResult[0]?.avgConfidence || 0;

        // Retry rate: sessions with multiple attempts (same customer, pending→verified/rejected)
        const retryRate = totalVerifications > 0
            ? Math.round(((totalVerifications - verifiedCount - rejectedCount) / totalVerifications) * 100)
            : 0;

        // Get last verified browser
        const lastVerification = await VerificationSession.findOne({ apiKeyId: { $in: keyIds } })
            .sort({ createdAt: -1 })
            .select('deviceInfo');

        res.status(200).json({
            success: true,
            data: {
                totalVerifications,
                verifiedCount,
                rejectedCount,
                verifiedPercent: totalVerifications > 0 ? Math.round((verifiedCount / totalVerifications) * 100) : 0,
                rejectedPercent: totalVerifications > 0 ? Math.round((rejectedCount / totalVerifications) * 100) : 0,
                avgConfidence: Math.round(avgConfidence),
                retryRate,
                lastBrowser: lastVerification?.deviceInfo?.browser || 'N/A'
            },
        });
    } catch (error: any) {
        logger.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Failed to get analytics' });
    }
};
