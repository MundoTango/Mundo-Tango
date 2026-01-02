#!/bin/bash
# ===========================================
# PREBUILD CLEANUP SCRIPT
# Reduces deployment image size by cleaning up
# large directories to stay under 8 GiB limit
# ===========================================

set -e

echo "=== Prebuild Cleanup Starting ==="
echo "Target: Reduce deployment image below 8 GiB limit"

# CRITICAL: Remove large data directories (10.5+ GB total)
echo ""
echo "=== Removing Large Directories ==="

# Remove LanceDB data (4.2GB) - not needed in production
if [ -d "lancedb_data" ]; then
    echo "Removing lancedb_data/ (~4.2GB)..."
    rm -rf lancedb_data/
fi

# Remove attached assets EXCEPT directories imported by source code
# IMPORTANT: Before adding new asset imports, ensure the directory is preserved here
if [ -d "attached_assets" ]; then
    echo "Cleaning attached_assets/..."
    echo "  PRESERVING: stock_images/ (20+ pages), optimized/ (7 pages), and scott-founder-optimized.jpg"
    
    # =================================================================
    # PRESERVED DIRECTORIES (used by React components via @assets/):
    # - stock_images/  → Used by 20+ pages (landing, marketing, etc.)
    # - optimized/     → Used by 7 pages (About, Home, Friends, Life-CEO pages)
    # - scott-founder-optimized.jpg → Used by LandingPage.tsx
    # 
    # If you add new asset imports, add the directory/file name to this list!
    # =================================================================
    
    find attached_assets -mindepth 1 -maxdepth 1 \
        ! -name "stock_images" \
        ! -name "optimized" \
        ! -name "scott-founder-optimized.jpg" \
        -exec rm -rf {} \; 2>/dev/null || true
    
    # Show what was preserved
    echo "  Remaining after cleanup:"
    ls -la attached_assets/ 2>/dev/null | grep "^d" | tail -n +2 || true
fi

# Remove test directories
echo "Removing test directories..."
rm -rf tests/ e2e/ 2>/dev/null || true

# Remove documentation and reports (EXCEPT critical files)
echo "Removing docs and reports..."
rm -rf docs/ qa_reports/ reports/ PRD/ journeys/ 2>/dev/null || true
rm -rf grafana/ grafana-provisioning/ MundoTangoAppemergent/ 2>/dev/null || true
rm -rf playwright-helpers/ postman/ bifrost-config/ 2>/dev/null || true

# =================================================================
# CRITICAL: NEVER DELETE THESE FILES/DIRECTORIES
# - mb.md            → Core methodology (MB.MD v2.0)
# - mb-legacy.md     → Legacy methodology backup
# - replit.md        → Project documentation
# - mr-blue-brain/   → Modular AI brain (30+ files, 140+ agents)
# =================================================================

# Remove agent reports and markdown files (EXCLUDING critical files)
echo "Removing agent report files..."
rm -f AGENT_*.md AGENT_*.json 2>/dev/null || true
rm -f HANDOFF*.md 2>/dev/null || true
rm -f *_REPORT*.md *_REPORT*.json 2>/dev/null || true

# Remove development config files
echo "Removing development configs..."
rm -f docker-compose*.yml Dockerfile* prometheus.yml 2>/dev/null || true
rm -f playwright.config.ts vitest.config.ts lighthouserc.json 2>/dev/null || true

echo ""
echo "=== Standard Cleanup ==="

# Remove broken symlinks (fixes /tmp/pulse-* error)
echo "Removing broken symlinks..."
find . -xtype l -delete 2>/dev/null || true

# Clean temporary files
echo "Cleaning temporary files..."
rm -rf tmp/ 2>/dev/null || true
rm -rf *.tmp 2>/dev/null || true
rm -rf *.temp 2>/dev/null || true

# Clean log files
echo "Cleaning log files..."
rm -rf logs/*.log 2>/dev/null || true
rm -f npm-debug.log* 2>/dev/null || true
rm -f yarn-debug.log* 2>/dev/null || true
rm -f yarn-error.log* 2>/dev/null || true

# Clean test artifacts
echo "Cleaning test artifacts..."
rm -rf test-results/ 2>/dev/null || true
rm -rf playwright-report/ 2>/dev/null || true
rm -rf coverage/ 2>/dev/null || true
rm -rf .nyc_output/ 2>/dev/null || true

# Clean build artifacts that might be stale
echo "Cleaning stale build artifacts..."
rm -rf *.tsbuildinfo 2>/dev/null || true

# Clean sourcemaps from dist (reduces size)
echo "Removing sourcemaps from dist..."
find dist/ -name "*.map" -delete 2>/dev/null || true

# Show disk usage summary
echo ""
echo "=== Cleanup Complete ==="
echo "Current directory sizes:"
du -sh dist/ 2>/dev/null || echo "dist/ not yet built"
du -sh . 2>/dev/null || true
echo ""
