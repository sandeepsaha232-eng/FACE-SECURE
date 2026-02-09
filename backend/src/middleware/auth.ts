import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

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
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            deviceId: decoded.deviceId,
        };
        next();
    } catch (error) {
        logger.warn('Invalid token attempt', { token: token.substring(0, 10) });
        res.status(403).json({
            success: false,
            error: 'forbidden',
            message: 'Invalid or expired token',
        });
    }
};
