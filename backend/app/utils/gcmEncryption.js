import crypto from 'crypto';

// --- Configuration ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_SIZE = 32; // 256 bits

// Load the encryption key from environment variables.
const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY_HEX || ENCRYPTION_KEY_HEX.length !== KEY_SIZE * 2) {
    console.error("FATAL ERROR: ENCRYPTION_KEY is missing or invalid. Must be 64-character hex string.");
}

const ENCRYPTION_KEY = ENCRYPTION_KEY_HEX ? Buffer.from(ENCRYPTION_KEY_HEX, 'hex') : null;


// --- Buffer Encryption/Decryption (For file contents) ---

/**
 * Encrypts a Buffer using AES-256-GCM.
 * The output now returns the encrypted content, IV, and AuthTag separately.
 * @param {Buffer} buffer - The plaintext data buffer to encrypt.
 * @returns {{encryptedBuffer: Buffer, ivHex: string, authTagHex: string}} - The ciphertext buffer and hex-encoded IV and AuthTag.
 */
export const encryptFileBuffer = (buffer) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    let encryptedContent = cipher.update(buffer);
    encryptedContent = Buffer.concat([encryptedContent, cipher.final()]);
    
    // AuthTag must be retrieved AFTER cipher.final()
    const tag = cipher.getAuthTag();

    return {
        encryptedBuffer: encryptedContent, // ONLY the ciphertext to be saved to disk
        ivHex: iv.toString('hex'),          // IV to be saved to DB
        authTagHex: tag.toString('hex')     // AuthTag to be saved to DB
    };
};


/**
 * Decrypts a file Buffer using AES-256-GCM, using IV and AuthTag from external source (DB).
 * @param {Buffer} encryptedBuffer - The ciphertext buffer (does NOT contain IV or Tag).
 * @param {string} ivHex - Hex-encoded IV from the database.
 * @param {string} authTagHex - Hex-encoded Authentication Tag from the database.
 * @returns {Buffer} - The original plaintext data buffer.
 * @throws {Error} If authentication fails or key is invalid.
 */
export const decryptFileBuffer = (encryptedBuffer, ivHex, authTagHex) => {
    if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== KEY_SIZE) {
        throw new Error("Invalid or missing ENCRYPTION_KEY. Check environment configuration.");
    }
    
    try {
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex'); // NEW: Get AuthTag from DB
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        
        decipher.setAuthTag(authTag); // NEW: Use AuthTag from DB
        
        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted;
    } catch (err) {
        // GCM decryption fails if the authentication tag doesn't match (data tampering)
        console.error("File Decryption failed (Authentication error, potential tampering):", err);
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