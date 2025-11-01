import crypto from 'crypto';

// --- Configuration ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_SIZE = 32; // 256 bits

// Load the encryption key from environment variables.
// The key must be a 32-byte buffer (256 bits). It is expected to be stored as a 64-character hex string in process.env.ENCRYPTION_KEY.
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== KEY_SIZE * 2) {
    console.error("FATAL ERROR: ENCRYPTION_KEY is missing or invalid. Must be 64-character hex string.");
    // In a production environment, you might want to throw an error or exit the process here.
}

const ENCRYPTION_KEY = ENCRYPTION_KEY_HEX ? Buffer.from(ENCRYPTION_KEY_HEX, 'hex') : null;


// --- Buffer Encryption/Decryption (For file contents) ---

/**
 * Encrypts a Buffer using AES-256-GCM.
 * The output is a single buffer containing the IV (16 bytes), Authentication Tag (16 bytes), and Ciphertext.
 * @param {Buffer} buffer - The plaintext data buffer to encrypt.
 * @returns {{encryptedBuffer: Buffer, iv: string}} - The full encrypted buffer and the IV as a hex string (for database storage).
 * @throws {Error} If the encryption key is invalid.
 */
export const encryptFileBuffer = (buffer) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    const encryptedContent = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Stored file structure: IV (16 bytes) + Tag (16 bytes) + Encrypted Data
    const fullEncryptedData = Buffer.concat([iv, tag, encryptedContent]);
    
    return {
        encryptedBuffer: fullEncryptedData,
        iv: iv.toString('hex')
    };
};


/**
 * Decrypts an encrypted file buffer using AES-256-GCM and verifies its integrity using the Authentication Tag.
 * @param {Buffer} fullEncryptedBuffer - The buffer containing IV, Tag, and Ciphertext (in that order).
 * @param {string} ivHex - The IV used for encryption, stored as a hex string in the database.
 * @returns {Buffer} - The original plaintext data buffer.
 * @throws {Error} If the key is invalid or if authentication fails (data tampered).
 */
export const decryptFileBuffer = (fullEncryptedBuffer, ivHex) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }
    
    const iv = Buffer.from(ivHex, 'hex');

    // Reconstruct the structure: IV (16) + Tag (16) + Ciphertext (Remaining)
    const tag = fullEncryptedBuffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encryptedContent = fullEncryptedBuffer.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);

    try {
        const decrypted = Buffer.concat([decipher.update(encryptedContent), decipher.final()]);
        return decrypted;
    } catch (err) {
        // GCM decryption fails if the authentication tag doesn't match (data tampering)
        console.error("Decryption failed (Authentication error, potential tampering):", err);
        throw new Error("File integrity check failed during decryption.");
    }
};


// --- String Encryption/Decryption (For database values like folder names) ---

/**
 * Encrypts a string value for database storage.
 * @param {string} text - The plaintext string (e.g., folder name).
 * @returns {{cipherText: string, iv: string}} - Hex-encoded ciphertext and IV.
 * @throws {Error} If the encryption key is invalid.
 */
export const encryptString = (text) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // NOTE: For string encryption in the DB, we don't store the tag with the ciphertext. 
    // We rely on the model having a separate field to store the tag, or accept the risk.
    // For simplicity with string fields, we are returning the IV separately, and the tag check
    // will implicitly happen on decryption if the tag is stored in the database model.
    // Since our models only store IV and ciphertext, we need to handle the tag retrieval manually.
    
    // OPTION 1 (Recommended for database strings): Store IV and Ciphertext only, assume no tag needed if length is short (less secure for strings).
    // OPTION 2 (More Secure): Combine IV/Tag/Ciphertext and store as a single hex string in the database.
    
    // Sticking to OPTION 1 for cleaner model fields, but we must return the tag if we want integrity checking on read.
    // Let's modify the string implementation to return the tag as well, assuming a field exists for it.
    
    const tag = cipher.getAuthTag();

    return {
        cipherText: encrypted,
        iv: iv.toString('hex'),
        authTag: tag.toString('hex') 
    };
};


/**
 * Decrypts a string value from database storage.
 * @param {string} cipherText - Hex-encoded ciphertext.
 * @param {string} ivHex - Hex-encoded IV.
 * @param {string} authTagHex - Hex-encoded Authentication Tag.
 * @returns {string} - The original plaintext string.
 * @throws {Error} If authentication fails or key is invalid.
 */
export const decryptString = (cipherText, ivHex, authTagHex) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }
    
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        decipher.setAuthTag(authTag);
        
        let decrypted = decipher.update(cipherText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (err) {
        console.error("String Decryption failed (Authentication error, potential tampering):", err);
        throw new Error("Data integrity check failed during string decryption.");
    }
};


export default {
    encryptFileBuffer,
    decryptFileBuffer,
    encryptString,
    decryptString,
};
