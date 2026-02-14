import mongoose, { Document, Schema } from 'mongoose';

export interface ILoginAttempt extends Document {
    deviceId: string;
    timestamp: Date;
    success: boolean;
    failureReason?: string;
    livenessScores?: {
        motion: number;
        texture: number;
        challenge: boolean;
        quality: number;
    };
    userId?: string;
    blocked: boolean;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>({
    deviceId: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    success: {
        type: Boolean,
        required: true,
    },
    failureReason: String,
    livenessScores: {
        motion: Number,
        texture: Number,
        challenge: Boolean,
        quality: Number,
    },
    userId: {
        type: String,
        ref: 'User',
    },
    blocked: {
        type: Boolean,
        default: false,
    },
});

// TTL index to auto-delete old logs after 90 days
LoginAttemptSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

export const LoginAttempt = mongoose.model<ILoginAttempt>('LoginAttempt', LoginAttemptSchema);
