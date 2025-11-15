# Package.json Scripts to Add

The following scripts need to be added to the `scripts` section of `package.json`:

```json
{
  "scripts": {
    "db:backup": "tsx scripts/db-backup.ts",
    "db:dry-run": "tsx scripts/db-dry-run.ts",
    "db:rollback": "tsx scripts/db-rollback.ts",
    "db:safe-migrate": "tsx scripts/safe-migrate.ts"
  }
}
```

## Usage

### Create a Database Backup
```bash
npm run db:backup
```

### Run Migration Dry-Run (Check for Issues)
```bash
npm run db:dry-run
```

### Rollback to a Previous Backup
```bash
npm run db:rollback [backup-file-path]
```

### Safe Migration (Backup + Dry-Run + Migrate)
```bash
npm run db:safe-migrate
```

## Features Implemented

### 1. Automated Backup System (`scripts/db-backup.ts`)
- Creates timestamped SQL backups using pg_dump
- Automatically creates `backups/` directory
- Compresses backups to save space
- Keeps only the N most recent backups (configurable)
- Verifies backup file integrity
- Provides detailed console output

### 2. Migration Dry-Run (`scripts/db-dry-run.ts`)
- Tests migrations before applying them
- Detects potential data loss scenarios
- Checks for warnings and errors
- Returns boolean success/failure status
- Zero database modifications

### 3. Rollback System (`scripts/db-rollback.ts`)
- Restores database from backup files
- Supports both .sql and .dump formats
- Can clean database before restore (--clean flag)
- Finds latest backup automatically if none specified
- Includes metadata tracking

### 4. Safe Migration Wrapper (`scripts/safe-migrate.ts`)
- Orchestrates the entire safe migration process:
  1. Creates automatic backup
  2. Runs dry-run to check for issues
  3. Applies migration if dry-run passes
  4. Automatically rolls back if migration fails
- Provides detailed step-by-step output
- Handles errors gracefully
- Keeps backup file for manual recovery if needed

## Directory Structure

```
backups/
├── backup-2025-11-15T10-30-00-000Z.sql
├── backup-2025-11-15T11-45-00-000Z.sql
└── mundo-tango-backup-2025-11-15T12-00-00-000Z.sql.gz
```

## Safety Features

✅ Zero-risk migrations with automated backups
✅ Pre-migration validation via dry-run
✅ Automatic rollback on failure
✅ Manual rollback capability
✅ Backup verification and integrity checks
✅ Data loss detection
✅ One-command safe migration
