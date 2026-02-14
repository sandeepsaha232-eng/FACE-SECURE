import crypto from 'crypto';

/**
 * Generate a secure API key, its public ID, and its hash for DB storage.
 */
export function generateApiKey(environment: 'test' | 'live' = 'live') {
    const keyId = crypto.randomBytes(4).toString('hex'); // Public ID
    const secret = crypto.randomBytes(32).toString('hex'); // Long secret

    // Format: ak_[env]_[keyId]_[secret]
    const envPrefix = environment === 'live' ? 'live' : 'test';
    const rawKey = `ak_${envPrefix}_${keyId}_${secret}`;

    // Hash for DB storage
    const keyHash = crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex');

    return { rawKey, keyId, keyHash };
}

/**
 * Helper to hash a raw API key for comparison during auth.
 */
export function hashApiKey(rawKey: string): string {
    return crypto
        .createHash('sha256')
        .update(rawKey)
        .digest('hex');
}
