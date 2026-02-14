import { Response } from 'express';
import crypto from 'crypto';
import { VerificationSession } from '../models/VerificationSession.model';
import { ApiKey } from '../models/ApiKey.model';
import { ApiKeyRequest } from '../middleware/apiKeyAuth';
import logger from '../utils/logger';

function generateSessionId(): string {
    return `vs_${crypto.randomBytes(12).toString('hex')}`;
}

/**
 * POST /v1/verification/session — Create a verification session
 * Authenticated via API key
 */
export const createSession = async (req: ApiKeyRequest, res: Response): Promise<void> => {
    try {
        if (!req.apiKey) {
            res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' });
            return;
        }

        const sessionId = generateSessionId();
        const baseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
        const verificationUrl = `${baseUrl}/verify?session=${sessionId}`;
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        const session = new VerificationSession({
            sessionId,
            apiKeyId: req.apiKey.apiKeyId,
            customerId: req.apiKey.customerId,
            status: 'pending',
            verificationUrl,
            expiresAt,
            signals: {
                liveness: 'pending',
                replay: 'pending',
                behavior: 'pending',
            },
        });

        await session.save();

        logger.info(`Verification session created: ${sessionId}`);

        res.status(201).json({
            session_id: sessionId,
            verification_url: verificationUrl,
            expires_at: expiresAt.toISOString(),
        });
    } catch (error: any) {
        logger.error('Create verification session error:', error);
        res.status(500).json({ error: 'server_error', message: 'Failed to create session' });
    }
};

/**
 * GET /v1/verification/session/:id — Get verification session result
 * Authenticated via API key
 */
export const getSession = async (req: ApiKeyRequest, res: Response): Promise<void> => {
    try {
        if (!req.apiKey) {
            res.status(401).json({ error: 'unauthorized', message: 'Invalid API key' });
            return;
        }

        const { id } = req.params;
        const session = await VerificationSession.findOne({
            sessionId: id,
            customerId: req.apiKey.customerId,
        });

        if (!session) {
            res.status(404).json({ error: 'not_found', message: 'Session not found' });
            return;
        }

        // Check if expired
        if (session.status === 'pending' && new Date() > session.expiresAt) {
            session.status = 'expired';
            await session.save();
        }

        res.status(200).json({
            session_id: session.sessionId,
            status: session.status,
            confidence: session.confidence,
            signals: session.signals,
            reason_codes: session.reasonCodes,
            verification_url: session.verificationUrl,
            expires_at: session.expiresAt.toISOString(),
            completed_at: session.completedAt?.toISOString() || null,
            created_at: session.createdAt.toISOString(),
        });
    } catch (error: any) {
        logger.error('Get verification session error:', error);
        res.status(500).json({ error: 'server_error', message: 'Failed to get session' });
    }
};

/**
 * Simulate completing a verification (called internally when liveness check finishes).
 * In production, this would be triggered by the camera flow completion.
 */
export const completeSession = async (req: ApiKeyRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, confidence, signals, reasonCodes } = req.body;

        const session = await VerificationSession.findOne({ sessionId: id });
        if (!session) {
            res.status(404).json({ error: 'not_found', message: 'Session not found' });
            return;
        }

        const userAgent = req.headers['user-agent'] || 'Other';
        const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

        let deviceType = 'Desktop';
        if (userAgent.includes('Macintosh')) deviceType = 'Mac';
        else if (userAgent.includes('iPhone')) deviceType = 'iPhone';
        else if (userAgent.includes('Samsung')) deviceType = 'Samsung';
        else if (userAgent.includes('Windows')) deviceType = 'Windows';

        session.status = status || 'verified';
        session.confidence = confidence || Math.floor(Math.random() * 30) + 70; // 70-100
        session.signals = signals || {
            liveness: 'pass',
            replay: 'none',
            behavior: 'normal',
        };
        session.deviceInfo = {
            ...session.deviceInfo,
            deviceType,
            browser: userAgent.includes('Chrome') ? 'Chrome' : 'Safari',
            os: userAgent.includes('Mac') ? 'macOS' : 'Windows'
        };
        session.ipAddress = String(ip).split(',')[0];
        session.location = {
            city: 'Mumbai',
            country: 'India',
            isp: 'Reliance Jio'
        };
        session.isEncrypted = true;
        session.reasonCodes = reasonCodes || [];
        session.completedAt = new Date();

        await session.save();

        // Update API key success/failure counts
        const apiKey = await ApiKey.findById(session.apiKeyId);
        if (apiKey) {
            if (session.status === 'verified') {
                apiKey.successCount += 1;
            } else {
                apiKey.failureCount += 1;
            }
            await apiKey.save();

            // Webhook delivery (fire and forget)
            if (apiKey.webhookUrl) {
                try {
                    const axios = require('axios');
                    await axios.post(apiKey.webhookUrl, {
                        event: 'verification.completed',
                        data: {
                            session_id: session.sessionId,
                            status: session.status,
                            confidence: session.confidence,
                            signals: session.signals,
                        },
                    }, {
                        headers: {
                            'X-Webhook-Secret': apiKey.webhookSecret,
                        },
                        timeout: 5000,
                    });

                    apiKey.webhookLastDelivery = {
                        status: 'success',
                        timestamp: new Date(),
                        statusCode: 200,
                    };
                } catch (webhookError: any) {
                    apiKey.webhookLastDelivery = {
                        status: 'failed',
                        timestamp: new Date(),
                        statusCode: webhookError.response?.status || 0,
                    };
                }
                await apiKey.save();
            }
        }

        logger.info(`Verification session completed: ${id} → ${session.status}`);

        res.status(200).json({
            success: true,
            session_id: session.sessionId,
            status: session.status,
            confidence: session.confidence,
        });
    } catch (error: any) {
        logger.error('Complete verification session error:', error);
        res.status(500).json({ error: 'server_error', message: 'Failed to complete session' });
    }
};
