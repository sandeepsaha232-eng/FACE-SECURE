import request from 'supertest';
import app from '../index';
import { User } from '../models/User.model';
import mongoose from 'mongoose';
import faceRecognitionService from '../services/faceRecognition.service';

// Mock the ML service to avoid external dependencies
jest.mock('../services/faceRecognition.service');

describe('FaceSecure Authentication API', () => {
    const mockFaceImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

    const mockLivenessData = {
        motionDetected: true,
        motionScore: 0.9,
        textureValid: true,
        textureScore: 0.95,
        challengePassed: true,
        challengeType: 'blink_twice',
        qualityScore: 0.9,
    };

    const mockMetadata = {
        timestamp: new Date().toISOString(),
        deviceId: 'device-123',
        sessionId: 'session-abc',
        videoHash: 'hash-xyz',
    };

    beforeEach(() => {
        // Reset mocks
        (faceRecognitionService.generateEmbedding as jest.Mock).mockResolvedValue({
            embedding: new Array(512).fill(0.1),
            quality: 0.95,
        });

        (faceRecognitionService.cosineSimilarity as jest.Mock).mockImplementation((vec1, vec2) => {
            // Simple mock similarity
            return 0.95;
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    faceImage: mockFaceImage,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.userId).toBeDefined();

            // Verify user in DB
            const user = await User.findOne({ email: 'test@example.com' });
            expect(user).toBeTruthy();
            expect(user?.name).toBe('Test User');
        });

        it('should prevent duplicate registration', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@example.com',
                    faceImage: mockFaceImage,
                });

            // Try registering again
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User 2',
                    email: 'test@example.com',
                    faceImage: mockFaceImage,
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('user_exists');
        });
    });

    describe('POST /api/auth/verify-face', () => {
        beforeEach(async () => {
            // Setup a registered user
            const user = new User({
                name: 'Verified User',
                email: 'verified@example.com',
                // Mock encrypted embedding (implementation handles encryption hook)
                faceEmbedding: new Array(512).fill(0.1),
                isActive: true,
            });
            await user.save();
        });

        it('should authenticate successfully with valid liveness and matching face', async () => {
            const res = await request(app)
                .post('/api/auth/verify-face')
                .send({
                    faceImage: mockFaceImage,
                    livenessData: mockLivenessData,
                    metadata: mockMetadata,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.sessionToken).toBeDefined();
            expect(res.body.user.email).toBe('verified@example.com');
            expect(res.body.similarity).toBeGreaterThan(0.85);
        });

        it('should reject when liveness check fails (motion)', async () => {
            const badLiveness = { ...mockLivenessData, motionScore: 0.1 };

            const res = await request(app)
                .post('/api/auth/verify-face')
                .send({
                    faceImage: mockFaceImage,
                    livenessData: badLiveness,
                    metadata: mockMetadata,
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('liveness_check_failed');
        });

        it('should reject when face does not match', async () => {
            // Mock low similarity
            (faceRecognitionService.cosineSimilarity as jest.Mock).mockReturnValue(0.4);

            const res = await request(app)
                .post('/api/auth/verify-face')
                .send({
                    faceImage: mockFaceImage,
                    livenessData: mockLivenessData,
                    metadata: mockMetadata,
                });

            expect(res.status).toBe(401);
            expect(res.body.error).toBe('authentication_failed');
        });

        it('should trigger MFA when match is medium confidence', async () => {
            // Mock medium similarity (between 0.70 and 0.85)
            (faceRecognitionService.cosineSimilarity as jest.Mock).mockReturnValue(0.80);

            const res = await request(app)
                .post('/api/auth/verify-face')
                .send({
                    faceImage: mockFaceImage,
                    livenessData: mockLivenessData,
                    metadata: mockMetadata,
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(false); // Success false but 200 OK means handled
            expect(res.body.error).toBe('mfa_required');
            expect(res.body.requireMFA).toBe(true);
        });

        it('should reject stale requests (timestamp check)', async () => {
            const staleMetadata = {
                ...mockMetadata,
                timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute old
            };

            const res = await request(app)
                .post('/api/auth/verify-face')
                .send({
                    faceImage: mockFaceImage,
                    livenessData: mockLivenessData,
                    metadata: staleMetadata,
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('request_expired');
        });
    });
});
