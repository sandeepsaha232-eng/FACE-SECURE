import { Response } from 'express';
import { User } from '../models/User.model';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

/**
 * Get user profile
 */
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        const user = await User.findById(userId).select('-password -faceEmbedding -loginHistory -deviceTrust');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error: any) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile',
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const updates = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }

        // Allowed fields to update
        const allowedFields = [
            'name',
            'username',
            'profilePhoto',
            'bio',
            'phoneNumber',
            'location',
            'dateOfBirth',
            'gender',
            'preferences',
        ];

        // Filter updates
        const filteredUpdates: any = {};
        Object.keys(updates).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        });

        // Validate username uniqueness if changed
        if (filteredUpdates.username) {
            const existingUser = await User.findOne({ username: filteredUpdates.username });
            if (existingUser && existingUser._id.toString() !== userId) {
                res.status(400).json({
                    success: false,
                    message: 'Username already taken',
                });
                return;
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: filteredUpdates },
            { new: true, runValidators: true }
        ).select('-password -faceEmbedding -loginHistory -deviceTrust');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error: any) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
        });
    }
};
