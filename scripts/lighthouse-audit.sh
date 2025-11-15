#!/bin/bash
set -e

echo "🚦 Running Lighthouse audit..."

# Install Lighthouse if needed
npm install -g @lhci/cli

# Run Lighthouse CI
lhci autorun --config=lighthouserc.json || echo "Running manual Lighthouse..."

# Manual Lighthouse for Mr. Blue
npx lighthouse http://localhost:5000/mr-blue \
  --output=html \
  --output-path=reports/lighthouse-mr-blue.html \
  --chrome-flags="--headless"

# Manual Lighthouse for Visual Editor
npx lighthouse http://localhost:5000/visual-editor \
  --output=html \
  --output-path=reports/lighthouse-visual-editor.html \
  --chrome-flags="--headless"

echo "✅ Lighthouse audit complete"
echo "Reports: reports/lighthouse-*.html"
