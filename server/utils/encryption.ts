import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive encryption key from environment secret
 * Uses scrypt for key derivation from SESSION_SECRET or ENCRYPTION_KEY
 */
function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET;
  
  if (!secret) {
    throw new Error('No encryption key available. Set ENCRYPTION_KEY or SESSION_SECRET environment variable.');
  }
  
  // Use a fixed salt for key derivation to ensure consistency
  // In production, this should be stored securely
  return crypto.scryptSync(secret, 'mundo-tango-salt-v1', KEY_LENGTH);
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
