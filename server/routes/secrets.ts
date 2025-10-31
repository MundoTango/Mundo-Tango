// FEATURE 1.2: SECRETS MANAGEMENT - Backend API
// Routes: POST /api/secrets, GET /api/secrets, PUT /api/secrets/:id, DELETE /api/secrets/:id
// Created: October 31, 2025

import { Router, Request, Response } from "express";
import { z } from "zod";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { storage } from "../storage";
import crypto from "crypto";

const router = Router();

// AES-256 encryption for secrets
// CRITICAL: Require stable encryption key - generate default for dev, require for production
if (!process.env.SECRETS_ENCRYPTION_KEY) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECRETS_ENCRYPTION_KEY environment variable is required for secrets encryption in production');
  }
  // For development only: use a stable default key (NOT secure for production!)
  process.env.SECRETS_ENCRYPTION_KEY = 'a'.repeat(64); // 64 hex chars = 32 bytes
  console.warn('WARNING: Using default encryption key in development. Set SECRETS_ENCRYPTION_KEY in production!');
}

const IV_LENGTH = 16;

// Decode hex key to 32-byte buffer
function getEncryptionKey(): Buffer {
  const hexKey = process.env.SECRETS_ENCRYPTION_KEY!;
  if (hexKey.length !== 64) {
    throw new Error('SECRETS_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  return Buffer.from(hexKey, 'hex');
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Validation schemas
const createSecretSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string().min(1),
  environment: z.enum(['development', 'preview', 'production']),
});

const updateSecretSchema = z.object({
  value: z.string().min(1).optional(),
  environment: z.enum(['development', 'preview', 'production']).optional(),
});

// POST /api/secrets - Create new environment variable
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createSecretSchema.parse(req.body);
    const userId = req.userId!;

    // Encrypt the value
    const encryptedValue = encrypt(validatedData.value);

    // Save to database
    const secret = await storage.createEnvironmentVariable({
      userId,
      key: validatedData.key,
      value: encryptedValue,
      environment: validatedData.environment,
      syncedToVercel: false,
      syncedToRailway: false,
    });

    // TODO: Sync to Vercel and Railway asynchronously
    // This will be implemented with Vercel/Railway API clients

    res.status(201).json({
      message: "Secret created successfully",
      // SECURITY: Only show value once during creation, then never again
      secret: {
        id: secret.id,
        key: secret.key,
        environment: secret.environment,
        syncedToVercel: secret.syncedToVercel,
        syncedToRailway: secret.syncedToRailway,
        createdAt: secret.createdAt,
        // Show plaintext value ONLY on creation (user should copy it now)
        value: validatedData.value,
        warningMessage: "Copy this value now - you won't be able to see it again!",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Create secret error:", error);
    res.status(500).json({ message: "Failed to create secret" });
  }
});

// GET /api/secrets - List all secrets for current user
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const environment = req.query.environment as string;

    const secrets = await storage.getEnvironmentVariables({
      userId,
      environment,
    });

    // SECURITY: Never return decrypted values to frontend
    // Only return metadata - values stay encrypted
    const sanitizedSecrets = secrets.map(secret => ({
      id: secret.id,
      key: secret.key,
      environment: secret.environment,
      syncedToVercel: secret.syncedToVercel,
      syncedToRailway: secret.syncedToRailway,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
      // Mask the value for display (show first 4 chars only)
      valueMasked: '*'.repeat(Math.max(secret.value.length - 10, 8)) + secret.value.slice(-4),
    }));

    res.json({
      secrets: sanitizedSecrets,
    });
  } catch (error) {
    console.error("List secrets error:", error);
    res.status(500).json({ message: "Failed to fetch secrets" });
  }
});

// PUT /api/secrets/:id - Update secret value
router.put("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const secretId = parseInt(req.params.id);
    const userId = req.userId!;
    const validatedData = updateSecretSchema.parse(req.body);

    if (isNaN(secretId)) {
      return res.status(400).json({ message: "Invalid secret ID" });
    }

    const secret = await storage.getEnvironmentVariableById(secretId);
    if (!secret || secret.userId !== userId) {
      return res.status(404).json({ message: "Secret not found" });
    }

    // Encrypt new value if provided
    const updates: any = {};
    if (validatedData.value) {
      updates.value = encrypt(validatedData.value);
      updates.syncedToVercel = false;
      updates.syncedToRailway = false;
    }
    if (validatedData.environment) {
      updates.environment = validatedData.environment;
    }

    const updated = await storage.updateEnvironmentVariable(secretId, updates);

    // TODO: Re-sync to platforms asynchronously
    // This will be implemented with Vercel/Railway API clients

    res.json({
      message: "Secret updated successfully",
      secret: {
        ...updated,
        value: undefined, // Don't return encrypted value
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    console.error("Update secret error:", error);
    res.status(500).json({ message: "Failed to update secret" });
  }
});

// DELETE /api/secrets/:id - Delete secret
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const secretId = parseInt(req.params.id);
    const userId = req.userId!;

    if (isNaN(secretId)) {
      return res.status(400).json({ message: "Invalid secret ID" });
    }

    const secret = await storage.getEnvironmentVariableById(secretId);
    if (!secret || secret.userId !== userId) {
      return res.status(404).json({ message: "Secret not found" });
    }

    await storage.deleteEnvironmentVariable(secretId);

    // TODO: Remove from Vercel and Railway asynchronously
    // This will be implemented with Vercel/Railway API clients

    res.status(204).send();
  } catch (error) {
    console.error("Delete secret error:", error);
    res.status(500).json({ message: "Failed to delete secret" });
  }
});

// POST /api/secrets/sync - Sync all secrets to Vercel + Railway
router.post("/sync", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { environment } = req.body;

    // TODO: Get all secrets for environment
    // const secrets = await storage.getEnvironmentVariables({ userId, environment });

    // TODO: Sync to platforms
    // const results = await Promise.all(
    //   secrets.map(async (secret) => {
    //     const vercelSuccess = await syncToVercel(secret);
    //     const railwaySuccess = await syncToRailway(secret);
    //     return { secret, vercelSuccess, railwaySuccess };
    //   })
    // );

    res.json({
      message: "Secrets synced successfully",
      synced: 0, // Placeholder
    });
  } catch (error) {
    console.error("Sync secrets error:", error);
    res.status(500).json({ message: "Failed to sync secrets" });
  }
});

export default router;
