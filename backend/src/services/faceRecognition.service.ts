import axios from 'axios';
import logger from '../utils/logger';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface FaceDetectionResult {
    faceDetected: boolean;
    confidence: number;
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface FaceEmbeddingResult {
    embedding: number[];
    quality: number;
}

export interface FaceComparisonResult {
    similarity: number;
    match: boolean;
    confidence: 'high' | 'medium' | 'low';
}

class FaceRecognitionService {
    /**
     * Detect face in image
     */
    async detectFace(imageBase64: string): Promise<FaceDetectionResult> {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/detect-face`, {
                image: imageBase64,
            });
            return response.data;
        } catch (error) {
            logger.error('Face detection failed:', error);
            throw new Error('Face detection service unavailable');
        }
    }

    /**
     * Generate face embedding from image
     */
    async generateEmbedding(imageBase64: string): Promise<FaceEmbeddingResult> {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/generate-embedding`, {
                image: imageBase64,
            });
            return response.data;
        } catch (error) {
            logger.error('Embedding generation failed:', error);
            throw new Error('Embedding generation service unavailable');
        }
    }

    /**
     * Compare two face embeddings
     */
    async compareEmbeddings(
        embedding1: number[],
        embedding2: number[]
    ): Promise<FaceComparisonResult> {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/compare-embeddings`, {
                embedding1,
                embedding2,
            });
            return response.data;
        } catch (error) {
            logger.error('Embedding comparison failed:', error);
            throw new Error('Comparison service unavailable');
        }
    }

    /**
     * Calculate cosine similarity between two vectors (fallback if ML service is down)
     */
    cosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length) {
            throw new Error('Vectors must have same length');
        }

        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            mag1 += vec1[i] * vec1[i];
            mag2 += vec2[i] * vec2[i];
        }

        mag1 = Math.sqrt(mag1);
        mag2 = Math.sqrt(mag2);

        if (mag1 === 0 || mag2 === 0) {
            return 0;
        }

        return dotProduct / (mag1 * mag2);
    }
}

export default new FaceRecognitionService();
