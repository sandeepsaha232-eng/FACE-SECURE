import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { LoginAttempt } from '../models/LoginAttempt.model';
import { Verification } from '../models/Verification.model';
import faceRecognitionService from '../services/faceRecognition.service';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
logger.info(`Auth Controller initialized with secret length: ${JWT_SECRET.length}`);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Thresholds from environment
const MIN_MOTION_SCORE = parseFloat(process.env.MIN_MOTION_SCORE || '0.7');
const MIN_TEXTURE_SCORE = parseFloat(process.env.MIN_TEXTURE_SCORE || '0.8');
const MIN_QUALITY_SCORE = parseFloat(process.env.MIN_QUALITY_SCORE || '0.75');
const FACE_MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || '0.85');
const FACE_MATCH_MFA_THRESHOLD = parseFloat(process.env.FACE_MATCH_MFA_THRESHOLD || '0.70');

interface LivenessData {
    motionDetected: boolean;
    motionScore: number;
    textureValid: boolean;
    textureScore: number;
    challengePassed: boolean;
    challengeType: string;
    qualityScore: number;
}

interface VerifyFaceRequest {
    faceImage: string; // base64 encoded
    livenessData: LivenessData;
    metadata: {
        timestamp: string;
        deviceId: string;
        sessionId: string;
        videoHash: string;
    };
    email?: string; // Optional for registration
}

/**
 * Step 10-11: Receive & Validate Request, Re-verify Liveness Data
 */
const validateLivenessData = (livenessData: LivenessData): { valid: boolean; reason?: string } => {
    if (!livenessData.motionDetected || livenessData.motionScore < MIN_MOTION_SCORE) {
        return { valid: false, reason: 'Motion detection failed' };
    }

    if (!livenessData.textureValid || livenessData.textureScore < MIN_TEXTURE_SCORE) {
        return { valid: false, reason: 'Texture analysis failed' };
    }

    if (!livenessData.challengePassed) {
        return { valid: false, reason: 'Challenge-response failed' };
    }

    if (livenessData.qualityScore < MIN_QUALITY_SCORE) {
        return { valid: false, reason: 'Image quality too low' };
    }

    return { valid: true };
};

/**
 * Step 12: Face Detection & Preprocessing (handled by ML service)
 * Step 13: Generate Face Embeddings
 * Step 14-15: Database Comparison & Decision Logic
 * Step 16-18: Generate Token & Return Response
 */
export const verifyFace = async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();

    try {
        const { faceImage, livenessData, metadata, email }: VerifyFaceRequest = req.body;

        // Step 10: Validate request
        if (!faceImage || !livenessData || !metadata) {
            res.status(400).json({
                success: false,
                error: 'invalid_request',
                message: 'Missing required fields',
            });
            return;
        }

        // Check timestamp freshness (< 30 seconds old)
        const requestAge = Date.now() - new Date(metadata.timestamp).getTime();
        if (requestAge > 30000) {
            res.status(400).json({
                success: false,
                error: 'request_expired',
                message: 'Request too old',
            });
            return;
        }

        // Step 11: Re-verify liveness data
        const livenessValidation = validateLivenessData(livenessData);
        if (!livenessValidation.valid) {
            await LoginAttempt.create({
                deviceId: metadata.deviceId,
                success: false,
                failureReason: livenessValidation.reason,
                livenessScores: {
                    motion: livenessData.motionScore,
                    texture: livenessData.textureScore,
                    challenge: livenessData.challengePassed,
                    quality: livenessData.qualityScore,
                },
            });

            res.status(400).json({
                success: false,
                error: 'liveness_check_failed',
                message: livenessValidation.reason,
                retryAllowed: true,
            });
            return;
        }

        // Step 12-13: Detect face and generate embedding via ML service
        logger.info('Generating face embedding...');
        const embeddingResult = await faceRecognitionService.generateEmbedding(faceImage);

        if (!embeddingResult || embeddingResult.quality < MIN_QUALITY_SCORE) {
            res.status(400).json({
                success: false,
                error: 'poor_image_quality',
                message: 'Face image quality too low',
                retryAllowed: true,
            });
            return;
        }

        // Step 14: Database comparison
        // For demo purposes, we'll search all users. In production, use email or other identifier
        const users = await User.find({ isActive: true }).select('+faceEmbedding');

        if (users.length === 0) {
            res.status(404).json({
                success: false,
                error: 'no_users_enrolled',
                message: 'No users found. Please register first.',
            });
            return;
        }

        // Find best match
        let bestMatch: any = null;
        let bestSimilarity = 0;

        for (const user of users) {
            if (user.faceEmbedding && user.faceEmbedding.length > 0) {
                const storedEmbedding = (user as any).decryptFaceEmbedding();
                const similarity = faceRecognitionService.cosineSimilarity(
                    embeddingResult.embedding,
                    storedEmbedding
                );

                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = user;
                }
            }
        }

        // Step 15: Decision logic
        if (bestSimilarity < FACE_MATCH_MFA_THRESHOLD) {
            // No match
            await LoginAttempt.create({
                deviceId: metadata.deviceId,
                success: false,
                failureReason: 'Face not recognized',
                livenessScores: {
                    motion: livenessData.motionScore,
                    texture: livenessData.textureScore,
                    challenge: livenessData.challengePassed,
                    quality: livenessData.qualityScore,
                },
            });

            res.status(401).json({
                success: false,
                error: 'authentication_failed',
                message: 'Face not recognized',
                retryAllowed: true,
            });
            return;
        }

        if (bestSimilarity < FACE_MATCH_THRESHOLD) {
            // Medium confidence - require MFA (simplified for demo)
            res.status(200).json({
                success: false,
                error: 'mfa_required',
                message: 'Additional verification required',
                requireMFA: true,
                userId: bestMatch._id,
            });
            return;
        }

        // High confidence match - Step 16: Generate session token
        const token = jwt.sign(
            {
                userId: bestMatch._id.toString(),
                email: bestMatch.email,
                deviceId: metadata.deviceId,
                authMethod: 'face_recognition',
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as any
        );

        // Step 17: Update database records
        bestMatch.loginHistory.push({
            timestamp: new Date(),
            deviceId: metadata.deviceId,
            authMethod: 'face',
            success: true,
        });
        await bestMatch.save();

        await LoginAttempt.create({
            deviceId: metadata.deviceId,
            success: true,
            userId: bestMatch._id,
            livenessScores: {
                motion: livenessData.motionScore,
                texture: livenessData.textureScore,
                challenge: livenessData.challengePassed,
                quality: livenessData.qualityScore,
            },
        });

        const duration = Date.now() - startTime;
        logger.info(`Face verification successful for ${bestMatch.email} in ${duration}ms`);

        // Step 18: Return response
        res.status(200).json({
            success: true,
            sessionToken: token,
            user: {
                id: bestMatch._id,
                name: bestMatch.name,
                email: bestMatch.email,
            },
            expiresIn: 3600,
            similarity: bestSimilarity,
        });
    } catch (error: any) {
        logger.error('Face verification error:', error);
        res.status(500).json({
            success: false,
            error: 'server_error',
            message: 'An error occurred during verification',
        });
    }
};

/**
 * Register a new user
 * Supports both face registration and password-only registration (for companies)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, faceImage, username } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                error: 'invalid_request',
                message: 'Name, email, and password are required',
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            if (existingUser.email === email) {
                res.status(400).json({
                    success: false,
                    error: 'user_exists',
                    message: 'User with this email already exists',
                });
                return;
            }
            if (username && existingUser.username === username) {
                res.status(400).json({
                    success: false,
                    error: 'username_exists',
                    message: 'Username is already taken',
                });
                return;
            }
        }

        let embedding = undefined;
        if (faceImage) {
            try {
                // Generate embedding if face image provided
                const embeddingResult = await faceRecognitionService.generateEmbedding(faceImage);
                embedding = embeddingResult.embedding;
            } catch (error) {
                logger.warn('Failed to generate embedding during registration, proceeding without face data', error);
                // We allow registration without face if generation fails, or we could strict fail.
                // Given the requirement, improved reliability is better so we fail if face was intended but failed?
                // Or since companies don't need it, maybe it's fine.
            }
        }

        // Create user
        const user = new User({
            name,
            email,
            password, // Will be hashed by pre-save hook
            username,
            faceEmbedding: embedding,
            isActive: true,
        });

        await user.save();

        logger.info(`New user registered: ${email}`);

        // Generate token for immediate login
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                authMethod: 'password',
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as any
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: user._id,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error: any) {
        logger.error('Registration error detailed:', {
            error: error.message,
            stack: error.stack,
            body: { ...req.body, password: '[REDACTED]', faceImage: req.body.faceImage ? 'present' : 'absent' }
        });
        res.status(500).json({
            success: false,
            error: 'server_error',
            message: 'An error occurred during registration: ' + error.message,
        });
    }
};

/**
 * Login with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
            return;
        }

        // Find user and select password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate token
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                authMethod: 'password',
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as any
        );

        // Update login history
        user.loginHistory.push({
            timestamp: new Date(),
            deviceId: 'unknown', // Todo: get device info from headers
            authMethod: 'password',
            success: true,
            location: 'unknown'
        });
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'server_error',
            message: 'An error occurred during login'
        });
    }
};

/**
 * Step 19: Submit one-off liveness verification with photo and name
 */
export const submitVerification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, faceImage, livenessScore } = req.body;

        if (!name || !faceImage) {
            res.status(400).json({
                success: false,
                message: 'Name and face image are required'
            });
            return;
        }

        const userAgent = req.headers['user-agent'] || 'Unknown';
        let browserName = 'Other';
        if (userAgent.includes('Chrome')) browserName = 'Chrome';
        else if (userAgent.includes('Firefox')) browserName = 'Firefox';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browserName = 'Safari';
        else if (userAgent.includes('Edg')) browserName = 'Edge';

        const verification = new Verification({
            name,
            faceImage,
            livenessScore: livenessScore || 1.0,
            status: 'verified',
            browser: browserName
        });

        await verification.save();

        logger.info(`Liveness verification saved for: ${name}`);

        res.status(201).json({
            success: true,
            message: 'Verified successfully. You a alive human',
            data: {
                id: verification._id,
                name: verification.name
            }
        });
    } catch (error: any) {
        logger.error('Verification submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit verification'
        });
    }
};

