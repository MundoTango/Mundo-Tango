/**
 * AES-256-GCM Encryption Utility
 * 
 * Provides transparent encryption/decryption for sensitive data at rest
 * Supports key rotation via version field
 * 
 * Usage:
 *   const encrypted = encryptData({ amount: 1000, description: "Rent" });
 *   const decrypted = decryptData(encrypted);
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SALT_LENGTH = 32;
const KEY_VERSION = 1; // Current encryption key version (for rotation)

/**
 * Derive encryption key from environment secret
 * Uses scrypt for key derivation from SECRETS_ENCRYPTION_KEY
 */
function getKey(): Buffer {
  const secret = process.env.SECRETS_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  
  if (!secret) {
    console.warn('⚠️  WARNING: SECRETS_ENCRYPTION_KEY not set! Using fallback key.');
    console.warn('⚠️  This is INSECURE for production. Set SECRETS_ENCRYPTION_KEY immediately.');
  }
  
  const finalSecret = secret || 'dev-key-insecure-replace-me-32chars!!';
  
  // Use a fixed salt for key derivation to ensure consistency
  // In production, this should be stored securely
  return crypto.scryptSync(finalSecret, 'mundo-tango-salt-v1', KEY_LENGTH);
}

/**
 * Derive a 256-bit encryption key with custom salt
 * This allows us to use different salts per encryption for additional security
 */
function deriveKeyWithSalt(salt: Buffer): Buffer {
  const secret = process.env.SECRETS_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  const finalSecret = secret || 'dev-key-insecure-replace-me-32chars!!';
  
  return crypto.pbkdf2Sync(
    finalSecret,
    salt,
    100000, // iterations
    32, // key length (256 bits)
    'sha256'
  );
}

/**
 * Encrypted payload structure for versioned encryption
 */
interface EncryptedPayload {
  version: number;
  iv: string;
  salt: string;
  authTag: string;
  data: string;
}

/**
 * Encrypt a string using AES-256-GCM
 * @param text - Plain text to encrypt
 * @returns Encrypted string in format: iv:tag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Return: iv:tag:encrypted
  return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 * @param encryptedData - Encrypted string in format: iv:tag:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    throw new Error('Cannot decrypt empty data');
  }

  const key = getKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt an object by JSON stringifying it first
 * @param obj - Object to encrypt
 * @returns Encrypted string
 */
export function encryptObject(obj: any): string {
  if (obj === null || obj === undefined) {
    throw new Error('Cannot encrypt null or undefined object');
  }
  
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt data and parse it as JSON object
 * @param encryptedData - Encrypted string
 * @returns Decrypted and parsed object
 */
export function decryptObject<T = any>(encryptedData: string): T {
  const decrypted = decrypt(encryptedData);
  return JSON.parse(decrypted) as T;
}

/**
 * Check if encryption is properly configured
 * @returns true if encryption is available
 */
export function isEncryptionAvailable(): boolean {
  try {
    const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
    return !!secret;
  } catch {
    return false;
  }
}

/**
 * Test encryption/decryption functionality
 * Useful for health checks
 */
export function testEncryption(): boolean {
  try {
    const testData = { test: 'data', number: 123 };
    const encrypted = encryptObject(testData);
    const decrypted = decryptObject(encrypted);
    return JSON.stringify(testData) === JSON.stringify(decrypted);
  } catch {
    return false;
  }
}

/**
 * Enhanced encryption with version support and per-encryption salt
 * Recommended for new implementations requiring key rotation
 * 
 * @param data - Any JSON-serializable data to encrypt
 * @returns Encrypted payload as JSON string with version info
 */
export function encryptData(data: any): string {
  const startTime = Date.now();
  
  try {
    const plaintext = JSON.stringify(data);
    
    // Generate random IV and salt for this encryption
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive encryption key with this salt
    const key = deriveKeyWithSalt(salt);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Construct versioned payload
    const payload: EncryptedPayload = {
      version: KEY_VERSION,
      iv: iv.toString('hex'),
      salt: salt.toString('hex'),
      authTag: authTag.toString('hex'),
      data: encrypted
    };
    
    const duration = Date.now() - startTime;
    if (duration > 10) {
      console.warn(`⚠️  Encryption took ${duration}ms (expected <10ms)`);
    }
    
    return JSON.stringify(payload);
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Enhanced decryption supporting versioned encryption
 * 
 * @param encryptedData - JSON string from encryptData()
 * @returns Original decrypted data
 */
export function decryptData(encryptedData: string): any {
  const startTime = Date.now();
  
  try {
    const payload: EncryptedPayload = JSON.parse(encryptedData);
    
    // Check version for key rotation support
    if (payload.version !== KEY_VERSION) {
      console.warn(`⚠️  Decrypting data with old key version ${payload.version}. Consider re-encrypting with version ${KEY_VERSION}.`);
    }
    
    // Convert hex strings back to buffers
    const iv = Buffer.from(payload.iv, 'hex');
    const salt = Buffer.from(payload.salt, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');
    const encrypted = Buffer.from(payload.data, 'hex');
    
    // Derive decryption key
    const key = deriveKeyWithSalt(salt);
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    const plaintext = decrypted.toString('utf8');
    const data = JSON.parse(plaintext);
    
    const duration = Date.now() - startTime;
    if (duration > 10) {
      console.warn(`⚠️  Decryption took ${duration}ms (expected <10ms)`);
    }
    
    return data;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string is versioned encrypted data
 */
export function isVersionedEncryption(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    return (
      typeof parsed === 'object' &&
      'version' in parsed &&
      'iv' in parsed &&
      'salt' in parsed &&
      'authTag' in parsed &&
      'data' in parsed
    );
  } catch {
    return false;
  }
}

/**
 * Re-encrypt data with current key version (for key rotation)
 */
export function rotateEncryption(encryptedData: string): string {
  const decrypted = decryptData(encryptedData);
  return encryptData(decrypted);
}

/**
 * Encrypt specific fields in an object
 * Returns object with encrypted_data field containing the encrypted fields
 * 
 * @example
 * const result = encryptFields(
 *   { targetAmount: 50000, currentAmount: 12000, title: "House" },
 *   ['targetAmount', 'currentAmount']
 * );
 * // Returns: { title: "House", encrypted_data: "..." }
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): Omit<T, typeof fieldsToEncrypt[number]> & { encrypted_data: string } {
  const dataToEncrypt: Record<string, any> = {};
  const remaining: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (fieldsToEncrypt.includes(key as keyof T)) {
      dataToEncrypt[key] = value;
    } else {
      remaining[key] = value;
    }
  }
  
  return {
    ...remaining,
    encrypted_data: encryptData(dataToEncrypt)
  } as any;
}

/**
 * Decrypt specific fields from encrypted_data
 * Returns object with decrypted fields merged in
 * 
 * @example
 * const result = decryptFields({ title: "House", encrypted_data: "..." });
 * // Returns: { title: "House", targetAmount: 50000, currentAmount: 12000 }
 */
export function decryptFields<T extends { encrypted_data: string }>(
  obj: T
): Omit<T, 'encrypted_data'> & Record<string, any> {
  const { encrypted_data, ...remaining } = obj;
  const decrypted = decryptData(encrypted_data);
  
  return {
    ...remaining,
    ...decrypted
  };
}
