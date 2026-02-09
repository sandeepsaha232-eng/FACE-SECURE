import rateLimit from 'express-rate-limit';

// Rate limiter for face verification endpoint
export const faceVerificationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Max 5 attempts per minute per IP
    message: {
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many verification attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per 15 minutes
    message: {
        success: false,
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please try again later.',
    },
});
