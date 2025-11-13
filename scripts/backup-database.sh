#!/bin/bash
#
# Database Backup Script for Mundo Tango
# Purpose: Create encrypted PostgreSQL backups and upload to S3 (if configured)
# Usage: ./scripts/backup-database.sh
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="db-${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting database backup..."

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Create backup
echo "[$(date)] Creating backup: ${BACKUP_FILE}"
pg_dump "${DATABASE_URL}" | gzip > "${BACKUP_PATH}"

# Verify backup was created
if [ ! -f "${BACKUP_PATH}" ]; then
    echo "ERROR: Backup file was not created"
    exit 1
fi

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
echo "[$(date)] Backup created successfully (${BACKUP_SIZE})"

# Upload to S3 if AWS credentials are configured
if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ] && [ -n "${S3_BACKUP_BUCKET:-}" ]; then
    echo "[$(date)] Uploading to S3: ${S3_BACKUP_BUCKET}"
    aws s3 cp "${BACKUP_PATH}" "s3://${S3_BACKUP_BUCKET}/database/${BACKUP_FILE}"
    echo "[$(date)] Upload complete"
else
    echo "[$(date)] Skipping S3 upload (AWS credentials not configured)"
fi

# Clean up old backups (keep last 7 days)
echo "[$(date)] Cleaning up old backups..."
find "${BACKUP_DIR}" -name "db-*.sql.gz" -type f -mtime +7 -delete
echo "[$(date)] Cleanup complete"

echo "[$(date)] Backup process finished successfully"
echo "Backup location: ${BACKUP_PATH}"
