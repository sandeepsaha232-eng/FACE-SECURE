// @ts-ignore
import mongoose, { Document, Schema } from 'mongoose';
// @ts-ignore
import crypto from 'crypto-js';
import bcrypt from 'bcrypt';

// Interface for User document
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string; // For fallback authentication
    faceEmbedding?: any; // mixed type: array in memory, string in DB (encrypted)
    deviceTrust: {
        deviceId: string;
        trustLevel: number;
        lastSeen: Date;
    }[];
    loginHistory: {
        timestamp: Date;
        ipAddress: string;
        deviceId: string;
        authMethod: 'face' | 'password';
        success: boolean;
        location?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    decryptFaceEmbedding(): number[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            select: false, // Don't include in queries by default
        },
        faceEmbedding: {
            type: Schema.Types.Mixed, // Allow array (in memory) or string (encrypted in DB)
            required: false, // Modified: Optional for companies not using face auth for themselves
            select: false,
        },
        deviceTrust: [
            {
                deviceId: String,
                trustLevel: {
                    type: Number,
                    min: 0,
                    max: 1,
                    default: 0.5,
                },
                lastSeen: Date,
            },
        ],
        loginHistory: [
            {
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                ipAddress: String,
                deviceId: String,
                authMethod: {
                    type: String,
                    enum: ['face', 'password'],
                },
                success: Boolean,
                location: String,
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster face embedding searches
UserSchema.index({ email: 1 });

// Encrypt face embedding before saving
UserSchema.pre('save', function (this: any, next: (err?: any) => void) {
    // 1. Encrypt Face Embedding if modified
    if (this.isModified('faceEmbedding') && this.faceEmbedding) {
        // If it's already a string (encrypted), skip
        if (typeof this.faceEmbedding === 'string') {
            // do nothing
        } else {
            try {
                const encrypted = crypto.AES.encrypt(
                    JSON.stringify(this.faceEmbedding),
                    process.env.ENCRYPTION_KEY || 'default-key'
                ).toString();
                this.faceEmbedding = encrypted;
            } catch (error) {
                return next(error);
            }
        }
    }

    // 2. Hash Password if modified
    if (this.isModified('password') && this.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);
            bcrypt.hash(this.password, salt, (err, hash) => {
                if (err) return next(err);
                this.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

// Method to decrypt face embedding
UserSchema.methods.decryptFaceEmbedding = function (this: IUser): number[] {
    if (!this.faceEmbedding) {
        return [];
    }

    // If it's already an array (not encrypted), return it
    if (Array.isArray(this.faceEmbedding)) {
        return this.faceEmbedding;
    }

    try {
        const bytes = crypto.AES.decrypt(
            String(this.faceEmbedding),
            process.env.ENCRYPTION_KEY || 'default-key'
        );
        return JSON.parse(bytes.toString(crypto.enc.Utf8));
    } catch (error) {
        console.error('Decryption failed:', error);
        return [];
    }
};

// Method to compare password
UserSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!this.password) return resolve(false);
        bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
            if (err) return reject(err);
            resolve(isMatch);
        });
    });
};

export const User = mongoose.model<IUser>('User', UserSchema);
