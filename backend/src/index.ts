import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import statsRoutes from './routes/stats.routes';
import apiKeyRoutes from './routes/apiKey.routes';
import verificationRoutes from './routes/verification.routes';
import { generalLimiter } from './middleware/rateLimit';
import logger from './utils/logger';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "img-src": ["'self'", "data:", "https:"],
        },
    },
}));
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = (process.env.FRONTEND_URL || 'https://facesecure-ten.vercel.app,https://facesecure-git-main-sandeeps-projects-d6bbd9b3.vercel.app,http://localhost:5173,http://localhost:3000')
            .split(',')
            .map(o => o.trim().replace(/\/$/, ""));
        // Allow requests with no origin (e.g. curl, server-to-server) or from allowed list
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Handle preflight explicitly
app.options('*', cors());

// Body parser
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', generalLimiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    next();
});

// Database connection middleware for Vercel
app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/health' || req.path === '/api/health') {
        return next();
    }

    try {
        await connectDatabase();
        next();
    } catch (error) {
        logger.error('Database connection failed:', error);
        res.status(500).json({
            success: false,
            error: 'database_error',
            message: 'Failed to connect to database'
        });
    }
});

// Health check endpoints
const healthHandler = (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        path: req.path
    });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/auth/health', healthHandler); // Just in case
app.get('/api/verify-deployment-v123', (req, res) => res.json({ deployed: true, timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/verification', verificationRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Endpoint not found',
        path: req.path,
        method: req.method,
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl
    });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'server_error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();

        // Start listening
        app.listen(Number(PORT), '0.0.0.0', () => {
            logger.info(`🚀 FaceSecure backend server listening on 0.0.0.0:${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            logger.info(`🤖 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start server only if run directly
if (require.main === module) {
    startServer();
}

export default app;
