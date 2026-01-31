/**
 * TWO-FACTOR AUTHENTICATION SERVICE (P0 #7)
 * TOTP implementation using speakeasy + QR codes
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '@shared/db';
import { userTwoFactor, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.SECRETS_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt sensitive data
 */
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(encrypted: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encryptedText = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate backup codes
 */
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Setup TOTP for a user
 */
export async function setupTOTP(userId: number, userEmail: string) {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `Mundo Tango (${userEmail})`,
    issuer: 'Mundo Tango',
    length: 32
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  // Delete any existing 2FA setup for this user
  await db.delete(userTwoFactor).where(eq(userTwoFactor.userId, userId));

  // Store encrypted secret in database
  await db.insert(userTwoFactor).values({
    userId,
    method: 'totp',
    secret: encrypt(secret.base32),
    backupCodes: backupCodes.map(code => encrypt(code)),
    isEnabled: false
  });

  return { 
    secret: secret.base32, 
    qrCode: qrCodeUrl,
    backupCodes 
  };
}

/**
 * Verify TOTP token
 */
export async function verifyTOTP(userId: number, token: string): Promise<boolean> {
  const twoFactor = await db.query.userTwoFactor.findFirst({
    where: and(
      eq(userTwoFactor.userId, userId),
      eq(userTwoFactor.method, 'totp')
    )
  });

  if (!twoFactor || !twoFactor.secret) {
    return false;
  }

  try {
    const decryptedSecret = decrypt(twoFactor.secret);
    
    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before and after current time
    });

    if (verified) {
      // Update last used timestamp
      await db.update(userTwoFactor)
        .set({ lastUsedAt: new Date() })
        .where(eq(userTwoFactor.id, twoFactor.id));
    }

    return verified;
  } catch (error) {
    console.error('2FA verification error:', error);
    return false;
  }
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(userId: number, code: string): Promise<boolean> {
  const twoFactor = await db.query.userTwoFactor.findFirst({
    where: and(
      eq(userTwoFactor.userId, userId),
      eq(userTwoFactor.method, 'totp')
    )
  });

  if (!twoFactor || !twoFactor.backupCodes || twoFactor.backupCodes.length === 0) {
    return false;
  }

  try {
    // Decrypt all backup codes
    const decryptedCodes = twoFactor.backupCodes.map((encCode: string) => decrypt(encCode));
    
    // Check if provided code matches any backup code
    const codeIndex = decryptedCodes.findIndex((bc: string) => bc === code.toUpperCase());
    
    if (codeIndex !== -1) {
      // Remove used backup code
      const updatedCodes = [...twoFactor.backupCodes];
      updatedCodes.splice(codeIndex, 1);
      
      await db.update(userTwoFactor)
        .set({ 
          backupCodes: updatedCodes,
          lastUsedAt: new Date()
        })
        .where(eq(userTwoFactor.id, twoFactor.id));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Backup code verification error:', error);
    return false;
  }
}

/**
 * Enable 2FA for a user
 */
export async function enable2FA(userId: number): Promise<boolean> {
  const result = await db.update(userTwoFactor)
    .set({ isEnabled: true })
    .where(and(
      eq(userTwoFactor.userId, userId),
      eq(userTwoFactor.method, 'totp')
    ))
    .returning();

  if (result.length > 0) {
    // Update user table
    await db.update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, userId));
    
    return true;
  }

  return false;
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: number): Promise<boolean> {
  await db.delete(userTwoFactor)
    .where(eq(userTwoFactor.userId, userId));

  await db.update(users)
    .set({ twoFactorEnabled: false })
    .where(eq(users.id, userId));

  return true;
}

/**
 * Check if user has 2FA enabled
 */
export async function is2FAEnabled(userId: number): Promise<boolean> {
  const twoFactor = await db.query.userTwoFactor.findFirst({
    where: and(
      eq(userTwoFactor.userId, userId),
      eq(userTwoFactor.isEnabled, true)
    )
  });

  return !!twoFactor;
}
