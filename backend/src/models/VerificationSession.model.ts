import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationSession extends Document {
    sessionId: string;
    apiKeyId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    status: 'pending' | 'verified' | 'rejected' | 'expired';
    confidence: number;
    signals: {
        liveness: 'pass' | 'fail' | 'pending';
        replay: 'none' | 'detected' | 'pending';
        behavior: 'normal' | 'suspicious' | 'pending';
    };
    reasonCodes: string[];
    verificationUrl: string;
    expiresAt: Date;
    deviceInfo?: {
        browser?: string;
        os?: string;
        device?: string;
        deviceType?: string; // "Mac", "Samsung", "iPhone", etc.
    };
    ipAddress?: string;
    location?: {
        city?: string;
        country?: string;
        isp?: string;
    };
    isEncrypted?: boolean;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const VerificationSessionSchema = new Schema<IVerificationSession>(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        apiKeyId: {
            type: Schema.Types.ObjectId,
            ref: 'ApiKey',
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'verified', 'rejected', 'expired'],
            default: 'pending',
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        signals: {
            liveness: {
                type: String,
                enum: ['pass', 'fail', 'pending'],
                default: 'pending',
            },
            replay: {
                type: String,
                enum: ['none', 'detected', 'pending'],
                default: 'pending',
            },
            behavior: {
                type: String,
                enum: ['normal', 'suspicious', 'pending'],
                default: 'pending',
            },
        },
        reasonCodes: [{ type: String }],
        verificationUrl: { type: String, required: true },
        deviceInfo: {
            browser: String,
            os: String,
            device: String,
        },
        expiresAt: { type: Date, required: true },
        completedAt: Date,
    },
    {
        timestamps: true,
    }
);

VerificationSessionSchema.index({ apiKeyId: 1, status: 1 });
VerificationSessionSchema.index({ customerId: 1, createdAt: -1 });

export const VerificationSession = mongoose.model<IVerificationSession>(
    'VerificationSession',
    VerificationSessionSchema
);
