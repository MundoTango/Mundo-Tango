#!/bin/bash

# ============================================================================
# PRE-DEPLOYMENT VALIDATION SCRIPT
# ============================================================================
# Runs comprehensive checks before deploying to production
# Usage: ./scripts/pre-deploy-check.sh
# ============================================================================

set -e  # Exit on error

echo "🚀 Mundo Tango - Pre-Deployment Validation"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================================================
# 1. Environment Variables Check
# ============================================================================
echo "1️⃣  Checking Environment Variables..."

required_vars=(
    "DATABASE_URL"
    "SESSION_SECRET"
    "JWT_SECRET"
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "STRIPE_SECRET_KEY"
    "OPENAI_API_KEY"
    "GROQ_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        error "Missing required environment variable: $var"
    else
        success "Environment variable set: $var"
    fi
done

echo ""

# ============================================================================
# 2. Node.js & Dependencies
# ============================================================================
echo "2️⃣  Checking Node.js and Dependencies..."

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    success "Node.js installed: $NODE_VERSION"
else
    error "Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    success "npm installed: $NPM_VERSION"
else
    error "npm not found"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
else
    error "node_modules not found - run 'npm install'"
fi

echo ""

# ============================================================================
# 3. TypeScript Compilation
# ============================================================================
echo "3️⃣  TypeScript Compilation Check..."

if npm run build > /dev/null 2>&1; then
    success "TypeScript compiles without errors"
else
    error "TypeScript compilation failed"
fi

echo ""

# ============================================================================
# 4. Linting
# ============================================================================
echo "4️⃣  Code Quality (ESLint)..."

if npm run lint > /dev/null 2>&1; then
    success "ESLint passed"
else
    warning "ESLint found issues (non-blocking)"
fi

echo ""

# ============================================================================
# 5. Security Audit
# ============================================================================
echo "5️⃣  Security Audit..."

AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1) || true
if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    success "No high/critical vulnerabilities found"
else
    warning "Security vulnerabilities detected - review 'npm audit'"
fi

echo ""

# ============================================================================
# 6. Database Connection
# ============================================================================
echo "6️⃣  Database Connection Test..."

if [ -n "$DATABASE_URL" ]; then
    # Simple check - try to connect
    if npm run db:push -- --check > /dev/null 2>&1; then
        success "Database connection successful"
    else
        error "Database connection failed"
    fi
else
    error "DATABASE_URL not set"
fi

echo ""

# ============================================================================
# 7. Build Size Check
# ============================================================================
echo "7️⃣  Build Size Optimization..."

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    success "Build size: $DIST_SIZE"
    
    # Check if build is too large (> 50MB warning)
    DIST_SIZE_MB=$(du -sm dist | cut -f1)
    if [ "$DIST_SIZE_MB" -gt 50 ]; then
        warning "Build size is large ($DIST_SIZE) - consider optimization"
    fi
else
    warning "dist directory not found - build not created yet"
fi

echo ""

# ============================================================================
# 8. Test Coverage
# ============================================================================
echo "8️⃣  Test Suite..."

if npm test > /dev/null 2>&1; then
    success "Test suite passed"
else
    warning "Some tests failed (check with 'npm test')"
fi

echo ""

# ============================================================================
# 9. Production Checklist
# ============================================================================
echo "9️⃣  Production Readiness Checklist..."

# Check if .env.production exists
if [ -f ".env.production" ]; then
    success ".env.production file exists"
else
    warning ".env.production not found (using environment variables)"
fi

# Check if monitoring is configured
if [ -n "$SENTRY_DSN" ]; then
    success "Sentry error tracking configured"
else
    warning "Sentry not configured (optional)"
fi

# Check if Redis is configured
if [ -n "$REDIS_URL" ]; then
    success "Redis caching configured"
else
    warning "Redis not configured (will use in-memory fallback)"
fi

echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo "=========================================="
echo "📊 Validation Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED checks"
echo -e "${RED}Failed:${NC} $CHECKS_FAILED checks"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical checks passed!${NC}"
    echo "   Ready for deployment 🚀"
    exit 0
else
    echo -e "${RED}❌ Deployment blocked${NC}"
    echo "   Fix the failed checks before deploying"
    exit 1
fi
