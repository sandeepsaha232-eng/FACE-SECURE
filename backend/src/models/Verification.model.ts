import mongoose, { Schema, Document } from 'mongoose';

export interface IVerification extends Document {
    name: string;
    faceImage: string; // base64
    timestamp: Date;
    livenessScore: number;
    status: 'pending' | 'verified' | 'rejected';
    browser?: string;
    ipAddress?: string;
    location?: {
        city?: string;
        country?: string;
    };
    deviceType?: string;
}

const VerificationSchema: Schema = new Schema({
    name: { type: String, required: true },
    faceImage: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    livenessScore: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'verified' },
    browser: { type: String },
    ipAddress: { type: String },
    location: {
        city: String,
        country: String
    },
    deviceType: { type: String }
});

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);
