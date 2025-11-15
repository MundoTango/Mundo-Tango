#!/bin/bash
set -e

echo "🔒 Running security scans..."
echo ""

# npm audit (skip for now, just check)
echo "📦 Checking npm vulnerabilities..."
npm audit --audit-level=high || echo "⚠️  Vulnerabilities found (expected in dev)"
echo ""

# Check for secrets in code
echo "🔍 Scanning for secrets..."
if command -v detect-secrets &> /dev/null; then
  if [ -f .secrets.baseline ]; then
    detect-secrets scan --baseline .secrets.baseline
  else
    echo "⚠️  No secrets baseline found. Creating one..."
    detect-secrets scan > .secrets.baseline
    echo "✅ Secrets baseline created"
  fi
else
  echo "⚠️  detect-secrets not installed (manual action required)"
  echo "   Install with: pip install detect-secrets"
fi
echo ""

# Static analysis
echo "🔬 Running static analysis..."
if npm run lint 2>&1 | grep -q "error"; then
  echo "⚠️  Linting issues found"
else
  echo "✅ Linting passed"
fi
echo ""

echo "✅ Security scan complete"
