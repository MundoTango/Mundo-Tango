# Database Safety Layer - Complete Documentation

## Overview

The Database Safety Layer provides zero-risk database migrations with automated backups, dry-runs, and rollback capabilities. This system ensures that database schema changes can be safely applied and reversed if needed.

## Quick Start

### Install (Manual Step Required)

Add these scripts to your `package.json`:

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

### Basic Usage

```bash
# Safest way to migrate (recommended)
npm run db:safe-migrate

# Individual operations
npm run db:backup           # Create manual backup
npm run db:dry-run          # Test migration without applying
npm run db:rollback         # Restore from latest backup
```

## Components

### 1. Database Backup (`db-backup.ts`)

**Purpose:** Creates timestamped SQL backups of the entire database.

**Features:**
- Automatic backup directory creation
- Timestamped backup files
- Optional compression (gzip)
- Automatic cleanup of old backups
- Backup verification
- Size reporting

**Usage:**
```bash
npm run db:backup
```

**Configuration (via environment variables):**
```bash
BACKUP_DIR=./backups        # Default backup location
MAX_BACKUPS=7              # Keep last 7 backups
```

**Output:**
```
backups/
├── mundo-tango-backup-2025-11-15T10-30-00-000Z.sql.gz
├── mundo-tango-backup-2025-11-15T11-45-00-000Z.sql.gz
└── mundo-tango-backup-2025-11-15T12-00-00-000Z.sql.gz
```

### 2. Migration Dry-Run (`db-dry-run.ts`)

**Purpose:** Test migrations before applying them to detect potential issues.

**Features:**
- Zero database modifications
- Data loss detection
- Warning detection
- Boolean success/failure return
- Detailed output logging

**Usage:**
```bash
npm run db:dry-run
```

**Exit Codes:**
- `0`: Dry-run passed, safe to migrate
- `1`: Issues detected, review before migrating

**Checks:**
- Data loss scenarios (DROP, DELETE operations)
- Migration warnings
- Schema conflicts

### 3. Database Rollback (`db-rollback.ts`)

**Purpose:** Restore database from a backup file.

**Features:**
- Automatic latest backup detection
- Manual backup file selection
- Support for .sql and .dump formats
- Optional clean restore
- Metadata tracking

**Usage:**
```bash
# Restore from latest backup
npm run db:rollback

# Restore from specific backup
npm run db:rollback backups/backup-2025-11-15T10-30-00-000Z.sql

# Clean restore (drop all tables first)
npm run db:rollback -- --clean
```

**Warning:** This operation is destructive and will overwrite your current database!

### 4. Safe Migration (`safe-migrate.ts`)

**Purpose:** Orchestrated migration with automatic safety checks and rollback.

**Features:**
- Automatic pre-migration backup
- Dry-run validation
- Migration application
- Automatic rollback on failure
- Step-by-step progress reporting

**Usage:**
```bash
npm run db:safe-migrate
```

**Process Flow:**
```
1. Create automatic backup
   ↓
2. Run dry-run checks
   ↓
3. If dry-run passes → Apply migration
   ↓
4. If migration fails → Automatic rollback
   ↓
5. Success or restored state
```

## Workflow Examples

### Example 1: Safe Schema Update

```bash
# 1. Modify your schema in shared/schema.ts
# 2. Run safe migration
npm run db:safe-migrate

# Output:
# 🔄 Starting safe database migration...
# 📦 Creating database backup...
# ✅ Backup created: backups/backup-2025-11-15T12-00-00-000Z.sql (2.34 MB)
# 🧪 Running migration dry-run...
# ✅ Dry-run passed
# ⚡ Applying database migration...
# ✅ Migration applied successfully!
# ✅ Safe migration completed successfully!
```

### Example 2: Migration with Data Loss Warning

```bash
npm run db:safe-migrate

# Output:
# 🔄 Starting safe database migration...
# 📦 Creating database backup...
# ✅ Backup created: backups/backup-2025-11-15T12-00-00-000Z.sql
# 🧪 Running migration dry-run...
# ⚠️  Migration may cause data loss!
# ❌ Dry-run detected issues. Migration aborted.
# 📦 Backup available at: backups/backup-2025-11-15T12-00-00-000Z.sql
```

### Example 3: Failed Migration with Auto-Rollback

```bash
npm run db:safe-migrate

# Output:
# 🔄 Starting safe database migration...
# 📦 Creating database backup...
# ✅ Backup created: backups/backup-2025-11-15T12-00-00-000Z.sql
# 🧪 Running migration dry-run...
# ✅ Dry-run passed
# ⚡ Applying database migration...
# ❌ Migration failed!
# 🔙 Attempting automatic rollback...
# ✅ Database restored to pre-migration state
```

### Example 4: Manual Rollback

```bash
# List available backups
ls -lh backups/

# Rollback to specific backup
npm run db:rollback backups/backup-2025-11-15T10-30-00-000Z.sql

# Output:
# 🔙 Rolling back to backup: backups/backup-2025-11-15T10-30-00-000Z.sql...
# ✅ Rollback completed successfully!
```

## Best Practices

### 1. Always Use Safe Migration

```bash
# ✅ DO: Use safe migration for schema changes
npm run db:safe-migrate

# ❌ DON'T: Apply migrations directly without backup
npm run db:push
```

### 2. Regular Backups

```bash
# Schedule regular backups (add to cron)
0 2 * * * cd /path/to/project && npm run db:backup
```

### 3. Test Migrations Locally First

```bash
# 1. Test on local database
npm run db:safe-migrate

# 2. Verify changes
npm run db:verify  # Your verification script

# 3. Apply to production
npm run db:safe-migrate
```

### 4. Keep Multiple Backup Points

```bash
# Before major changes, create named backup
npm run db:backup
cp backups/latest.sql backups/before-major-refactor.sql
```

## Troubleshooting

### Issue: Backup Directory Not Created

**Solution:**
```bash
mkdir -p backups
npm run db:backup
```

### Issue: Permission Denied on pg_dump

**Solution:**
```bash
# Ensure DATABASE_URL is set
echo $DATABASE_URL

# Check pg_dump is installed
which pg_dump
```

### Issue: Rollback Fails

**Solution:**
```bash
# Manual rollback
psql $DATABASE_URL < backups/your-backup.sql
```

### Issue: Out of Disk Space

**Solution:**
```bash
# Clean old backups
npm run db:backup  # Creates new backup and auto-cleans old ones

# Or manually remove old backups
rm backups/old-backup-*.sql
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `BACKUP_DIR` | `./backups` | Backup storage directory |
| `MAX_BACKUPS` | `7` | Maximum backups to retain |

## Security Considerations

1. **Backup File Security**: Backup files contain your entire database. Store them securely.
2. **Environment Variables**: Never commit `DATABASE_URL` to version control.
3. **Rollback Access**: Limit who can run rollback operations in production.
4. **Backup Encryption**: Consider encrypting backups for sensitive data.

## Integration with CI/CD

```yaml
# Example GitHub Actions workflow
name: Safe Database Migration

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
      - name: Install dependencies
        run: npm install
      - name: Safe Migration
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: npm run db:safe-migrate
```

## Future Enhancements

- [ ] Backup encryption
- [ ] Remote backup storage (S3, etc.)
- [ ] Migration versioning
- [ ] Email/Slack notifications
- [ ] Backup rotation policies
- [ ] Point-in-time recovery
- [ ] Migration history tracking

## Support

For issues or questions:
1. Check this documentation
2. Review error messages and logs
3. Test on local database first
4. Contact database administrator if needed
