import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
logger.info(`JWT Middleware initialized with secret length: ${JWT_SECRET.length}`);

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        deviceId: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            error: 'unauthorized',
            message: 'No token provided',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        // Assert invariants
        if (!decoded.userId) {
            logger.error('Token payload missing userId', { decoded });
            res.status(401).json({
                success: false,
                error: 'unauthorized',
                message: 'Invalid token payload',
            });
            return;
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            deviceId: decoded.deviceId,
        };
        next();
    } catch (error: any) {
        const errorName = error.name || 'TokenError';
        logger.warn('Authentication failed:', {
            name: errorName,
            message: error.message,
            tokenPrefix: token.substring(0, 10)
        });

        // TokenExpiredError → 401 (re-authenticate)
        // All other errors → 403 (forbidden)
        if (errorName === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                error: 'unauthorized',
                message: 'Token expired',
            });
        } else {
            res.status(403).json({
                success: false,
                error: 'forbidden',
                message: 'Invalid token',
            });
        }
    }
};
