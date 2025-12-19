#!/bin/bash
set -e

echo "=== Starting optimized production build ==="
echo "Allocating 8GB memory for Node.js"
export NODE_OPTIONS="--max-old-space-size=8192"
export NODE_ENV="production"

echo ""
echo "=== Step 0/4: Running prebuild cleanup ==="
bash scripts/prebuild-cleanup.sh 2>/dev/null || echo "Cleanup script not found, continuing..."

echo ""
echo "=== Step 1/4: Building client (Vite) ==="
npx vite build

echo ""
echo "=== Allowing garbage collection (5s pause) ==="
sleep 5

echo ""
echo "=== Step 2/4: Building server (esbuild) ==="
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo ""
echo "=== Step 3/4: Post-build cleanup ==="
# Remove sourcemaps from production build
find dist/ -name "*.map" -delete 2>/dev/null || true

echo ""
echo "=== Step 4/4: Build complete! ==="
echo "Output: dist/public (client) and dist/index.js (server)"
echo ""
echo "=== Build Size Summary ==="
du -sh dist/
du -sh dist/public/ 2>/dev/null || true
du -sh dist/index.js 2>/dev/null || true
