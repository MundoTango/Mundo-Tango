import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Database Backup Automation
 * Automated PostgreSQL backups with retention policy
 */

export interface BackupConfig {
  backupDir: string;
  retentionDays: number;
  maxBackups: number;
  compressionEnabled: boolean;
}

const defaultConfig: BackupConfig = {
  backupDir: path.join(__dirname, "../../backups"),
  retentionDays: 7,
  maxBackups: 30,
  compressionEnabled: true,
};

/**
 * Create database backup
 */
export async function createBackup(config: Partial<BackupConfig> = {}): Promise<string> {
  const finalConfig = { ...defaultConfig, ...config };
  const { backupDir, compressionEnabled } = finalConfig;

  // Ensure backup directory exists
  await fs.mkdir(backupDir, { recursive: true });

  // Generate backup filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFilename = `backup_${timestamp}.sql${compressionEnabled ? ".gz" : ""}`;
  const backupPath = path.join(backupDir, backupFilename);

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable not set");
  }

  try {
    // Create backup using pg_dump
    const pgDumpCmd = compressionEnabled
      ? `pg_dump "${databaseUrl}" | gzip > "${backupPath}"`
      : `pg_dump "${databaseUrl}" > "${backupPath}"`;

    await execAsync(pgDumpCmd);

    // Get backup file size
    const stats = await fs.stat(backupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`[Backup] Created backup: ${backupFilename} (${sizeInMB}MB)`);

    return backupPath;
  } catch (error) {
    console.error("[Backup] Failed to create backup:", error);
    throw error;
  }
}

/**
 * List all backups
 */
export async function listBackups(backupDir: string = defaultConfig.backupDir): Promise<
  Array<{
    filename: string;
    path: string;
    size: number;
    created: Date;
  }>
> {
  try {
    await fs.mkdir(backupDir, { recursive: true });
    const files = await fs.readdir(backupDir);

    const backups = await Promise.all(
      files
        .filter((file) => file.startsWith("backup_") && (file.endsWith(".sql") || file.endsWith(".sql.gz")))
        .map(async (file) => {
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
          };
        })
    );

    return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error("[Backup] Failed to list backups:", error);
    return [];
  }
}

/**
 * Delete old backups based on retention policy
 */
export async function cleanupOldBackups(config: Partial<BackupConfig> = {}): Promise<number> {
  const finalConfig = { ...defaultConfig, ...config };
  const { backupDir, retentionDays, maxBackups } = finalConfig;

  const backups = await listBackups(backupDir);
  let deletedCount = 0;

  const now = new Date();
  const retentionMs = retentionDays * 24 * 60 * 60 * 1000;

  for (let i = 0; i < backups.length; i++) {
    const backup = backups[i];
    const age = now.getTime() - backup.created.getTime();

    // Delete if older than retention days OR exceeds max backups
    if (age > retentionMs || i >= maxBackups) {
      try {
        await fs.unlink(backup.path);
        console.log(`[Backup] Deleted old backup: ${backup.filename}`);
        deletedCount++;
      } catch (error) {
        console.error(`[Backup] Failed to delete backup ${backup.filename}:`, error);
      }
    }
  }

  return deletedCount;
}

/**
 * Restore database from backup
 */
export async function restoreBackup(backupPath: string): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable not set");
  }

  try {
    const isCompressed = backupPath.endsWith(".gz");

    const restoreCmd = isCompressed
      ? `gunzip -c "${backupPath}" | psql "${databaseUrl}"`
      : `psql "${databaseUrl}" < "${backupPath}"`;

    await execAsync(restoreCmd);
    console.log(`[Backup] Successfully restored from: ${path.basename(backupPath)}`);
  } catch (error) {
    console.error("[Backup] Failed to restore backup:", error);
    throw error;
  }
}

/**
 * Get backup statistics
 */
export async function getBackupStats(backupDir: string = defaultConfig.backupDir): Promise<{
  totalBackups: number;
  totalSize: number;
  oldestBackup: Date | null;
  newestBackup: Date | null;
}> {
  const backups = await listBackups(backupDir);

  if (backups.length === 0) {
    return {
      totalBackups: 0,
      totalSize: 0,
      oldestBackup: null,
      newestBackup: null,
    };
  }

  return {
    totalBackups: backups.length,
    totalSize: backups.reduce((sum, b) => sum + b.size, 0),
    oldestBackup: backups[backups.length - 1].created,
    newestBackup: backups[0].created,
  };
}

/**
 * Schedule automatic backups
 */
export function scheduleBackups(config: Partial<BackupConfig> = {}, intervalHours: number = 24): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  console.log(`[Backup] Scheduling automatic backups every ${intervalHours} hours`);

  return setInterval(async () => {
    try {
      console.log("[Backup] Running scheduled backup...");
      await createBackup(config);
      await cleanupOldBackups(config);
    } catch (error) {
      console.error("[Backup] Scheduled backup failed:", error);
    }
  }, intervalMs);
}

export default {
  createBackup,
  listBackups,
  cleanupOldBackups,
  restoreBackup,
  getBackupStats,
  scheduleBackups,
};
