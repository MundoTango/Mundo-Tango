#!/usr/bin/env tsx
// ============================================================================
// DATABASE BACKUP SCRIPT - Mundo Tango
// ============================================================================
// Creates automated backups of PostgreSQL database
// Run: tsx scripts/db-backup.ts
// Schedule in cron: 0 2 * * * tsx /path/to/scripts/db-backup.ts
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface BackupConfig {
  databaseUrl: string;
  backupDir: string;
  maxBackups: number;
  compress: boolean;
}

const config: BackupConfig = {
  databaseUrl: process.env.DATABASE_URL || '',
  backupDir: process.env.BACKUP_DIR || path.join(process.cwd(), 'backups'),
  maxBackups: parseInt(process.env.MAX_BACKUPS || '7', 10),
  compress: true,
};

async function ensureBackupDir(): Promise<void> {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`📁 Created backup directory: ${config.backupDir}`);
  }
}

async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `mundo-tango-backup-${timestamp}.sql`;
  const backupPath = path.join(config.backupDir, filename);
  
  console.log(`🔄 Starting backup: ${filename}`);
  
  // Use pg_dump to create backup
  const command = `pg_dump ${config.databaseUrl} > ${backupPath}`;
  
  try {
    await execAsync(command);
    console.log(`✅ Backup created: ${backupPath}`);
    
    // Compress if enabled
    if (config.compress) {
      await compressBackup(backupPath);
    }
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

async function compressBackup(backupPath: string): Promise<void> {
  console.log(`🗜️  Compressing backup...`);
  
  const compressedPath = `${backupPath}.gz`;
  const command = `gzip ${backupPath}`;
  
  try {
    await execAsync(command);
    console.log(`✅ Compressed: ${compressedPath}`);
  } catch (error) {
    console.error('⚠️ Compression failed:', error);
    // Continue without compression
  }
}

async function cleanOldBackups(): Promise<void> {
  const files = fs.readdirSync(config.backupDir)
    .filter(f => f.startsWith('mundo-tango-backup-'))
    .map(f => ({
      name: f,
      path: path.join(config.backupDir, f),
      time: fs.statSync(path.join(config.backupDir, f)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time);
  
  if (files.length > config.maxBackups) {
    const toDelete = files.slice(config.maxBackups);
    
    console.log(`🗑️  Removing ${toDelete.length} old backup(s)...`);
    
    for (const file of toDelete) {
      fs.unlinkSync(file.path);
      console.log(`   Deleted: ${file.name}`);
    }
  }
}

async function verifyBackup(backupPath: string): Promise<boolean> {
  try {
    const stats = fs.statSync(backupPath);
    
    // Check if file exists and is not empty
    if (stats.size === 0) {
      console.error('❌ Backup file is empty!');
      return false;
    }
    
    console.log(`✅ Backup verified (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (error) {
    console.error('❌ Backup verification failed:', error);
    return false;
  }
}

async function sendBackupNotification(success: boolean, details: string): Promise<void> {
  // Placeholder for notification (Slack, email, etc.)
  if (success) {
    console.log(`📧 Notification: Backup completed successfully - ${details}`);
  } else {
    console.error(`📧 Notification: Backup failed - ${details}`);
  }
  
  // TODO: Implement actual notification system
  // await sendSlackNotification(message);
  // await sendEmail(message);
}

async function main(): Promise<void> {
  console.log('🚀 Starting database backup process...\n');
  
  if (!config.databaseUrl) {
    console.error('❌ DATABASE_URL environment variable not set!');
    process.exit(1);
  }
  
  try {
    // Ensure backup directory exists
    await ensureBackupDir();
    
    // Create backup
    const backupPath = await createBackup();
    
    // Verify backup
    const verified = await verifyBackup(backupPath);
    
    if (!verified) {
      throw new Error('Backup verification failed');
    }
    
    // Clean old backups
    await cleanOldBackups();
    
    // Send success notification
    await sendBackupNotification(true, path.basename(backupPath));
    
    console.log('\n✅ Backup process completed successfully!');
  } catch (error) {
    console.error('\n❌ Backup process failed!');
    await sendBackupNotification(false, error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

// Run backup
main();
