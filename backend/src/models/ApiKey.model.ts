import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
    keyId: string;
    keyHash: string;
    keyPrefix: string;
    name: string;
    customerId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId; // Alias for customerId
    environment: 'test' | 'live';
    status: 'active' | 'suspended' | 'revoked';
    plan: 'free' | 'pro' | 'enterprise';
    rateLimit: number;
    webhookUrl?: string;
    webhookSecret?: string;
    webhookRetryPolicy: 'none' | 'once' | 'twice' | 'thrice';
    webhookLastDelivery?: {
        status: 'success' | 'failed';
        timestamp: Date;
        statusCode?: number;
    };
    dataRetention: '24h' | '7d' | '30d' | 'none';
    disableVideoStorage: boolean;
    requireExtraVerification: boolean;
    monthlyUsage: number;
    dailyUsage: number;
    dailyUsageDate: string; // YYYY-MM-DD to reset daily counter
    successCount: number;
    failureCount: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
    {
        keyId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyHash: {
            type: String,
            required: true,
            index: true,
        },
        keyPrefix: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: 'My API Key',
            trim: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        environment: {
            type: String,
            enum: ['test', 'live'],
            default: 'live',
        },
        status: {
            type: String,
            enum: ['active', 'suspended', 'revoked'],
            default: 'active',
        },
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free',
        },
        rateLimit: {
            type: Number,
            default: 60, // requests per minute
        },
        webhookUrl: { type: String },
        webhookSecret: { type: String },
        webhookRetryPolicy: {
            type: String,
            enum: ['none', 'once', 'twice', 'thrice'],
            default: 'once',
        },
        webhookLastDelivery: {
            status: { type: String, enum: ['success', 'failed'] },
            timestamp: Date,
            statusCode: Number,
        },
        dataRetention: {
            type: String,
            enum: ['24h', '7d', '30d', 'none'],
            default: '7d',
        },
        disableVideoStorage: {
            type: Boolean,
            default: false,
        },
        requireExtraVerification: {
            type: Boolean,
            default: false,
        },
        monthlyUsage: { type: Number, default: 0 },
        dailyUsage: { type: Number, default: 0 },
        dailyUsageDate: { type: String, default: '' },
        successCount: { type: Number, default: 0 },
        failureCount: { type: Number, default: 0 },
        lastUsedAt: Date,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ApiKeySchema.virtual('userId').get(function (this: IApiKey) {
    return this.customerId;
});

ApiKeySchema.virtual('userId').set(function (this: IApiKey, val: mongoose.Types.ObjectId) {
    this.customerId = val;
});

ApiKeySchema.index({ customerId: 1, status: 1 });

export const ApiKey = mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
