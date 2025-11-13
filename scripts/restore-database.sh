#!/bin/bash
#
# Database Restore Script for Mundo Tango
# Purpose: Restore PostgreSQL database from backup
# Usage: ./scripts/restore-database.sh <backup-file>
#

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration
BACKUP_FILE="${1:-}"

# Validate input
if [ -z "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not specified"
    echo "Usage: ./scripts/restore-database.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh ./backups/db-*.sql.gz 2>/dev/null || echo "No backups found in ./backups/"
    exit 1
fi

# Check if backup file exists
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    echo "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "[$(date)] DANGER: This will OVERWRITE the current database!"
echo "Database: ${DATABASE_URL}"
echo "Backup file: ${BACKUP_FILE}"
echo ""
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo "[$(date)] Starting database restore..."

# Create temporary uncompressed file
TEMP_SQL=$(mktemp)
echo "[$(date)] Decompressing backup..."
gunzip -c "${BACKUP_FILE}" > "${TEMP_SQL}"

# Verify SQL file is valid
if [ ! -s "${TEMP_SQL}" ]; then
    echo "ERROR: Decompressed backup is empty"
    rm -f "${TEMP_SQL}"
    exit 1
fi

# Restore database
echo "[$(date)] Restoring database..."
psql "${DATABASE_URL}" < "${TEMP_SQL}"

# Clean up
rm -f "${TEMP_SQL}"

echo "[$(date)] Database restored successfully"
echo ""
echo "IMPORTANT: Please verify the restored data:"
echo "  psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM users;\""
echo "  psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM posts;\""
