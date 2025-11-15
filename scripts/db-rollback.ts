import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, readdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface RollbackOptions {
  backupFile?: string;
  backupDir?: string;
  clean?: boolean;
}

async function rollbackDatabase(options: RollbackOptions = {}) {
  const {
    backupFile,
    backupDir = './backups',
    clean = false,
  } = options;

  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    let targetBackup = backupFile;

    if (!targetBackup) {
      console.log('🔍 Finding latest backup...');
      const files = await readdir(backupDir);
      const backupFiles = files
        .filter(f => f.endsWith('.dump') || f.endsWith('.sql'))
        .sort()
        .reverse();

      if (backupFiles.length === 0) {
        throw new Error('No backup files found in backup directory');
      }

      targetBackup = path.join(backupDir, backupFiles[0]);
      console.log(`📦 Using latest backup: ${backupFiles[0]}`);
    }

    const metaFile = `${targetBackup}.meta.json`;
    let metadata;
    try {
      const metaContent = await readFile(metaFile, 'utf-8');
      metadata = JSON.parse(metaContent);
      console.log('📋 Backup metadata:', {
        timestamp: metadata.timestamp,
        format: metadata.format,
      });
    } catch {
      console.warn('⚠️  No metadata file found, proceeding without validation');
    }

    console.log('⚠️  WARNING: This will restore the database to a previous state!');
    console.log(`📁 Backup file: ${targetBackup}`);
    
    if (clean) {
      console.log('🧹 Cleaning database before restore...');
      await execAsync(`psql ${databaseUrl} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`);
    }

    console.log('🔄 Starting database rollback...');

    const isCustomFormat = targetBackup.endsWith('.dump');
    const restoreCommand = isCustomFormat
      ? `pg_restore ${databaseUrl} --clean --if-exists -d ${databaseUrl} ${targetBackup}`
      : `psql ${databaseUrl} < ${targetBackup}`;

    await execAsync(restoreCommand, {
      env: { ...process.env },
      maxBuffer: 1024 * 1024 * 100,
    });

    console.log('✅ Database rollback completed successfully!');
    console.log(`📦 Restored from: ${targetBackup}`);
    
    return {
      success: true,
      backupFile: targetBackup,
      metadata,
    };
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const backupFile = process.argv[2];
  const clean = process.argv.includes('--clean');
  
  rollbackDatabase({ backupFile, clean })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { rollbackDatabase };
