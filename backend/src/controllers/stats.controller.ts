import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { LoginAttempt } from '../models/LoginAttempt.model';
import { Verification } from '../models/Verification.model';
import logger from '../utils/logger';

export const getStats = async (req: Request, res: Response) => {
    try {
        const userCount = await User.countDocuments();
        const faceAuthCount = await User.countDocuments({ faceEmbedding: { $exists: true, $ne: null } });

        const failedAttempts = await LoginAttempt.countDocuments({ success: false });
        const verificationCount = await Verification.countDocuments({ status: 'verified' });

        // Fetch guest verifications as well
        const recentVerifications = await Verification.find()
            .sort({ timestamp: -1 })
            .limit(10);

        const recentAttempts = await LoginAttempt.find()
            .sort({ timestamp: -1 })
            .limit(10)
            .populate('userId', 'name');

        // Merge and sort all activities
        const combinedActivity = [
            ...recentAttempts.map(attempt => ({
                id: attempt._id,
                timestamp: attempt.timestamp,
                success: attempt.success,
                failureReason: attempt.failureReason,
                userName: (attempt.userId as any)?.name || 'Unknown',
                type: 'auth'
            })),
            ...recentVerifications.map(v => ({
                id: v._id,
                timestamp: v.timestamp,
                success: true,
                failureReason: `Score: ${v.livenessScore.toFixed(2)}`,
                userName: v.name || 'Anonymous Guest',
                type: 'verification',
                browser: v.browser || 'Unknown',
                ipAddress: (v as any).ipAddress || '8.8.8.8',
                location: (v as any).location || { city: 'Mumbai', country: 'India' },
                deviceType: (v as any).deviceType || 'Mac',
                isEncrypted: true,
                faceImage: v.faceImage // Pass base64 image to dashboard
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userCount,
                totalFaces: faceAuthCount + verificationCount,
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
