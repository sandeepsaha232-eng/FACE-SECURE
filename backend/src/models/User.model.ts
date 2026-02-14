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
        deviceId: string;
        authMethod: 'face' | 'password';
        success: boolean;
        location?: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    // Profile Fields
    username?: string;
    profilePhoto?: string;
    bio?: string;
    phoneNumber?: string;
    location?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
    preferences?: {
        language: string;
        theme: 'light' | 'dark' | 'system';
        notifications: {
            email: boolean;
            push: boolean;
        };
        privacy: {
            profilePublic: boolean;
        };
    };
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
        // Profile Fields
        username: {
            type: String,
            unique: true,
            sparse: true, // Allows null/undefined to not conflict
            trim: true,
            minlength: 3,
        },
        profilePhoto: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            maxlength: 500,
            default: '',
        },
        phoneNumber: {
            type: String,
            trim: true,
            default: '',
        },
        location: {
            type: String,
            trim: true,
            default: '',
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
            default: '',
        },
        preferences: {
            language: {
                type: String,
                default: 'en',
            },
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'system',
            },
            notifications: {
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
            },
            privacy: {
                profilePublic: { type: Boolean, default: false },
            },
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
            // Check if it looks like it's already encrypted (CryptoJS AES format starts with U2FsdGVkX1)
            const isAlreadyEncrypted = typeof this.faceEmbedding === 'string' && this.faceEmbedding.startsWith('U2FsdGVkX1');

            if (isAlreadyEncrypted) {
                logger.debug('Face embedding already encrypted, skipping encryption');
            } else {
                try {
                    logger.debug('Encrypting new face embedding...');
                    const dataToEncrypt = typeof this.faceEmbedding === 'string'
                        ? this.faceEmbedding
                        : JSON.stringify(this.faceEmbedding);

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
            logger.warn('Decryption returned empty string (wrong key or malformed data)');
            return [];
        }

        // Final safety check: must be valid JSON to be an embedding array
        try {
            return JSON.parse(decryptedData);
        } catch (parseError) {
            logger.error('Decrypted data is not valid JSON:', {
                decryptedPrefix: decryptedData.substring(0, 50)
            });
            return [];
        }
    } catch (error: any) {
        logger.error('Failed to decrypt face embedding:', {
            error: error.message
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
