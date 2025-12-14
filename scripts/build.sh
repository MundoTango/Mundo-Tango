#!/bin/bash
set -e

echo "=== Starting optimized production build ==="
echo "Allocating 8GB memory for Node.js"
export NODE_OPTIONS="--max-old-space-size=8192"

echo ""
echo "=== Step 1/3: Building client (Vite) ==="
npx vite build

echo ""
echo "=== Allowing garbage collection (5s pause) ==="
sleep 5

echo ""
echo "=== Step 2/3: Building server (esbuild) ==="
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo ""
echo "=== Step 3/3: Build complete! ==="
echo "Output: dist/public (client) and dist/index.js (server)"
