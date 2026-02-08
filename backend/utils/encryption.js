const CryptoJS = require('crypto-js');

// Secret key for encryption (should be in .env in production)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-min-32-chars';

/**
 * Encrypt a string (like MongoDB ObjectId) to a URL-safe hash
 * @param {string} text - Text to encrypt
 * @returns {string} - URL-safe encrypted string
 */
const encryptId = (text) => {
    try {
        const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
        // Make URL-safe by replacing special characters
        return encrypted
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt ID');
    }
};

/**
 * Decrypt a URL-safe hash back to original string
 * @param {string} encryptedText - Encrypted text to decrypt
 * @returns {string} - Original decrypted string
 */
const decryptId = (encryptedText) => {
    try {
        // Restore URL-safe characters
        let encrypted = encryptedText
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        // Add padding if needed
        while (encrypted.length % 4) {
            encrypted += '=';
        }

        const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
        const original = decrypted.toString(CryptoJS.enc.Utf8);

        if (!original) {
            throw new Error('Decryption failed - invalid hash');
        }

        return original;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Invalid or corrupted hash');
    }
};

/**
 * Generate a secure hash for resource sharing
 * Combines resource ID with timestamp and random salt
 * @param {string} resourceId - MongoDB ObjectId
 * @param {string} resourceType - 'post' or 'user'
 * @returns {string} - Secure hash
 */
const generateSecureHash = (resourceId, resourceType) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const data = `${resourceType}:${resourceId}:${timestamp}:${random}`;
    return encryptId(data);
};

/**
 * Parse a secure hash to extract resource information
 * @param {string} hash - Encrypted hash
 * @returns {object} - { resourceType, resourceId, timestamp, random }
 */
const parseSecureHash = (hash) => {
    try {
        const decrypted = decryptId(hash);
        const [resourceType, resourceId, timestamp, random] = decrypted.split(':');

        if (!resourceType || !resourceId) {
            throw new Error('Invalid hash format');
        }

        return {
            resourceType,
            resourceId,
            timestamp: parseInt(timestamp),
            random
        };
    } catch (error) {
        throw new Error('Invalid or expired hash');
    }
};

module.exports = {
    encryptId,
    decryptId,
    generateSecureHash,
    parseSecureHash
};
