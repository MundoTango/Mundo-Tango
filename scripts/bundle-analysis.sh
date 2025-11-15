#!/bin/bash
set -e

echo "📦 Analyzing bundle size..."

# Build
npm run build

# Get total size
TOTAL_SIZE=$(du -sh dist/ | awk '{print $1}')
echo "Total bundle size: $TOTAL_SIZE"

# Get largest files
echo "Largest chunks:"
find dist/assets -name "*.js" -exec du -h {} \; | sort -rh | head -10

# Check against targets
MAIN_JS=$(find dist/assets -name "index-*.js" -exec du -k {} \; | awk '{print $1}')
if [ $MAIN_JS -gt 500 ]; then
  echo "⚠️ Main bundle exceeds 500KB target"
else
  echo "✅ Main bundle within target"
fi

# Generate report
cat > reports/performance-bundle.md << EOF
# Bundle Size Report

Total Size: $TOTAL_SIZE
Main JS: ${MAIN_JS}KB

## Largest Chunks
$(find dist/assets -name "*.js" -exec du -h {} \; | sort -rh | head -10)

## Recommendations
- Code splitting: Lazy load Visual Editor
- Tree shaking: Remove unused dependencies
- Compression: Enable gzip/brotli
EOF

echo "✅ Bundle analysis complete"
