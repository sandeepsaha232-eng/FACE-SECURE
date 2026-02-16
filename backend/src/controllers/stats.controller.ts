import { Response } from 'express';
import { User } from '../models/User.model';
import { LoginAttempt } from '../models/LoginAttempt.model';
import { VerificationSession } from '../models/VerificationSession.model';
import { ApiKey } from '../models/ApiKey.model';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ success: false, message: 'Unauthorized' });
            return;
        }

        // 1. Get User's own status
        const user = await User.findById(userId);
        const hasFaceAuth = !!(user?.faceEmbedding);

        // 2. Get User's API Keys to find their verification sessions
        const userKeys = await ApiKey.find({ customerId: userId }).select('_id');
        const keyIds = userKeys.map(k => k._id);

        // 3. Get counts specific to this user
        const totalVerifications = await VerificationSession.countDocuments({ apiKeyId: { $in: keyIds } });
        const failedAttempts = await LoginAttempt.countDocuments({ userId: userId, success: false });

        // 4. Get Recent Login Activity (Personal)
        const recentAttempts = await LoginAttempt.find({ userId: userId })
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('userId', 'name');

        // 5. Get Recent Verification Sessions (Personal)
        const recentVerifications = await VerificationSession.find({ apiKeyId: { $in: keyIds } })
            .sort({ createdAt: -1 })
            .limit(10);

        // Merge and sort
        const combinedActivity = [
            ...recentAttempts.map(attempt => ({
                id: attempt._id,
                timestamp: attempt.timestamp,
                success: attempt.success,
                failureReason: attempt.failureReason,
                userName: 'Me', // It's the user themselves
                type: 'auth'
            })),
            ...recentVerifications.map(v => ({
                id: v._id,
                timestamp: v.createdAt,
                success: v.status === 'verified',
                failureReason: v.status === 'verified' ? `Score: ${v.confidence}` : v.status,
                userName: 'Guest User', // These are people verifying against the user's keys
                type: 'verification',
                browser: v.deviceInfo?.browser || 'Unknown',
                ipAddress: v.ipAddress || 'Unknown',
                location: v.location || { city: 'Unknown', country: 'Unknown' },
                deviceType: v.deviceInfo?.deviceType || 'Unknown',
                isEncrypted: v.isEncrypted || true,
                // Do NOT return face images here for privacy/size reasons unless explicitly requested
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                totalUsers: 1, // Just the user themselves
                totalFaces: hasFaceAuth ? 1 : 0, // Just the user themselves
                totalVerifications: totalVerifications, // Total verifications performed for this user
                failedAttempts,
                recentActivity: combinedActivity
            }
        });
    } catch (error) {
        logger.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
};
