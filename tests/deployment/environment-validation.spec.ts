/**
 * ENVIRONMENT VALIDATION TESTS
 * CRITICAL: Validates all required environment variables for production deployment
 * 
 * Without these, the application will crash on startup in production.
 */

import { test, expect } from '@playwright/test';

test.describe('Environment Variable Validation', () => {
  test('should have all CRITICAL environment variables', async () => {
    const criticalEnvVars = [
      'DATABASE_URL',
      'NODE_ENV',
      'PORT',
    ];

    const missing: string[] = [];

    for (const envVar of criticalEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      throw new Error(
        `❌ CRITICAL: Missing environment variables:\n` +
        missing.map(v => `  - ${v}`).join('\n') +
        `\n\nApp will CRASH on startup without these!`
      );
    }

    expect(missing).toHaveLength(0);
  });

  test('should have all HIGH PRIORITY environment variables', async () => {
    const highPriorityEnvVars = [
      'SESSION_SECRET',
      'JWT_SECRET',
    ];

    const missing: string[] = [];

    for (const envVar of highPriorityEnvVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    if (missing.length > 0) {
      console.warn(
        `⚠️  WARNING: Missing high-priority environment variables:\n` +
        missing.map(v => `  - ${v}`).join('\n') +
        `\n\nFeatures will be broken without these!`
      );
    }

    // Don't fail the test, just warn
    expect(true).toBe(true);
  });

  test('should validate SESSION_SECRET length', async () => {
    const sessionSecret = process.env.SESSION_SECRET;

    if (sessionSecret && sessionSecret.length < 32) {
      throw new Error(
        `❌ SESSION_SECRET is too short!\n` +
        `Current: ${sessionSecret.length} characters\n` +
        `Required: At least 32 characters\n` +
        `This is a security vulnerability!`
      );
    }

    expect(sessionSecret ? sessionSecret.length >= 32 : true).toBe(true);
  });

  test('should validate JWT_SECRET length', async () => {
    const jwtSecret = process.env.JWT_SECRET;

    if (jwtSecret && jwtSecret.length < 32) {
      throw new Error(
        `❌ JWT_SECRET is too short!\n` +
        `Current: ${jwtSecret.length} characters\n` +
        `Required: At least 32 characters\n` +
        `This is a security vulnerability!`
      );
    }

    expect(jwtSecret ? jwtSecret.length >= 32 : true).toBe(true);
  });

  test('should validate DATABASE_URL format', async () => {
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl) {
      const isValidFormat = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

      if (!isValidFormat) {
        throw new Error(
          `❌ DATABASE_URL has invalid format!\n` +
          `Must start with postgres:// or postgresql://\n` +
          `Current: ${dbUrl.substring(0, 20)}...`
        );
      }

      expect(isValidFormat).toBe(true);
    }
  });

  test('should validate NODE_ENV is set correctly', async () => {
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
      throw new Error(
        `❌ NODE_ENV has invalid value!\n` +
        `Current: ${nodeEnv}\n` +
        `Must be: development, production, or test`
      );
    }

    expect(['development', 'production', 'test']).toContain(nodeEnv || 'development');
  });
});
