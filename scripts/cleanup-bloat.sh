#!/bin/bash

echo "🧹 Mundo Tango - Project Bloat Cleanup Script"
echo "=============================================="
echo ""

# Get initial size
INITIAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "📊 Initial project size: $INITIAL_SIZE"
echo ""

# Function to display size savings
check_savings() {
  CURRENT_SIZE=$(du -sh . 2>/dev/null | cut -f1)
  echo "✅ Current size: $CURRENT_SIZE"
}

# 1. Clear Playwright browser cache (1.5GB)
echo "🗑️  Step 1/7: Clearing Playwright browser cache..."
if [ -d ".cache/ms-playwright" ]; then
  rm -rf .cache/ms-playwright/
  echo "   ✓ Removed .cache/ms-playwright/"
else
  echo "   ⊘ Directory not found (already clean)"
fi
check_savings
echo ""

# 2. Clear Bun install cache (358MB)
echo "🗑️  Step 2/7: Clearing Bun install cache..."
if [ -d ".cache/.bun/install" ]; then
  rm -rf .cache/.bun/install/
  echo "   ✓ Removed .cache/.bun/install/"
else
  echo "   ⊘ Directory not found (already clean)"
fi
check_savings
echo ""

# 3. Clear TypeScript cache (36MB)
echo "🗑️  Step 3/7: Clearing TypeScript cache..."
if [ -d ".cache/typescript" ]; then
  rm -rf .cache/typescript/
  echo "   ✓ Removed .cache/typescript/"
else
  echo "   ⊘ Directory not found (already clean)"
fi
check_savings
echo ""

# 4. Clear test results and artifacts (3MB+)
echo "🗑️  Step 4/7: Clearing test artifacts..."
ARTIFACTS_FOUND=0
if [ -d "test-results" ]; then
  rm -rf test-results/
  echo "   ✓ Removed test-results/"
  ARTIFACTS_FOUND=1
fi
if [ -d "playwright-report" ]; then
  rm -rf playwright-report/
  echo "   ✓ Removed playwright-report/"
  ARTIFACTS_FOUND=1
fi
find . -name "trace.zip" -delete 2>/dev/null && ARTIFACTS_FOUND=1
if [ $ARTIFACTS_FOUND -eq 0 ]; then
  echo "   ⊘ No artifacts found (already clean)"
fi
check_savings
echo ""

# 5. Clear Vite cache
echo "🗑️  Step 5/7: Clearing Vite cache..."
if [ -d "node_modules/.vite" ]; then
  rm -rf node_modules/.vite/
  echo "   ✓ Removed node_modules/.vite/"
else
  echo "   ⊘ Directory not found (already clean)"
fi
check_savings
echo ""

# 6. Git garbage collection
echo "🗑️  Step 6/7: Running Git garbage collection..."
git gc --aggressive --prune=now 2>/dev/null
git reflog expire --expire=now --all 2>/dev/null
echo "   ✓ Git optimized"
check_savings
echo ""

# 7. Clear .local/state (if safe)
echo "🗑️  Step 7/7: Checking .local directory..."
if [ -d ".local/state" ]; then
  LOCAL_SIZE=$(du -sh .local/state 2>/dev/null | cut -f1)
  echo "   ⚠️  Found .local/state ($LOCAL_SIZE)"
  echo "   ⊘ Skipping (may contain important Replit state)"
else
  echo "   ⊘ Directory not found"
fi
echo ""

# Final report
FINAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "=============================================="
echo "🎉 Cleanup Complete!"
echo "   Before: $INITIAL_SIZE"
echo "   After:  $FINAL_SIZE"
echo ""
echo "📋 What was cleaned:"
echo "   • Playwright browser binaries (~1.5GB)"
echo "   • Bun package cache (~358MB)"
echo "   • TypeScript cache (~36MB)"
echo "   • Test artifacts and traces"
echo "   • Vite build cache"
echo "   • Git loose objects"
echo ""
echo "⚡ To reinstall Playwright browsers:"
echo "   npx playwright install"
echo ""
echo "✅ Project is now optimized for Replit Agent!"
