// @ts-ignore
import mongoose, { Document, Schema } from 'mongoose';
// @ts-ignore
import crypto from 'crypto-js';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

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
UserSchema.pre('save', async function (this: any) {
    try {
        // 1. Encrypt Face Embedding if modified
        if (this.isModified('faceEmbedding') && this.faceEmbedding) {
            // If it's already a string (likely encrypted), skip
            if (typeof this.faceEmbedding === 'string') {
                logger.debug('Face embedding already encrypted (string type), skipping encryption');
            } else {
                try {
                    logger.debug('Encrypting new face embedding...');
                    const dataToEncrypt = JSON.stringify(this.faceEmbedding);
                    const encrypted = crypto.AES.encrypt(
                        dataToEncrypt,
                        process.env.ENCRYPTION_KEY || 'default-key'
                    ).toString();
                    this.faceEmbedding = encrypted;
                } catch (error) {
                    logger.error('Face embedding encryption failed:', error);
                    throw error;
                }
            }
        }

        // 2. Hash Password if modified
        if (this.isModified('password') && this.password) {
            try {
                logger.debug('Hashing user password...');
                const salt = await bcrypt.genSalt(10);
                this.password = await bcrypt.hash(this.password, salt);
            } catch (error) {
                logger.error('Password hashing failed:', error);
                throw error;
            }
        }
    } catch (error) {
        logger.error('Error in User pre-save hook:', error);
        throw error;
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

    let decryptedData = '';
    try {
        const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key';
        const bytes = crypto.AES.decrypt(
            String(this.faceEmbedding),
            encryptionKey
        );
        decryptedData = bytes.toString(crypto.enc.Utf8);

        if (!decryptedData) {
            logger.warn('Decryption returned empty string, possibly wrong key');
            return [];
        }

        // Check if the decrypted data is valid JSON before parsing
        if (!decryptedData.startsWith('[') && !decryptedData.startsWith('{')) {
            logger.warn('Decrypted data does not look like JSON:', decryptedData.substring(0, 20));
            return [];
        }

        return JSON.parse(decryptedData);
    } catch (error: any) {
        logger.error('Failed to decrypt or parse face embedding:', {
            error: error.message,
            decryptedPrefix: decryptedData ? decryptedData.substring(0, 50) : 'none'
        });
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
