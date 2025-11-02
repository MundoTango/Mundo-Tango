#!/bin/bash

###############################################################################
# COMPREHENSIVE TEST SUITE EXECUTION SCRIPT
# 
# This script orchestrates the complete test suite execution:
# 1. Documentation gap analysis
# 2. Playwright E2E tests
# 3. Report generation
# 
# Usage:
#   ./tests/run-comprehensive-test-suite.sh
#   ./tests/run-comprehensive-test-suite.sh --headed    # Run with browser visible
#   ./tests/run-comprehensive-test-suite.sh --debug     # Run in debug mode
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
HEADED_MODE=""
DEBUG_MODE=""

for arg in "$@"
do
    case $arg in
        --headed)
        HEADED_MODE="--headed"
        shift
        ;;
        --debug)
        DEBUG_MODE="--debug"
        shift
        ;;
    esac
done

# Print header
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "   MUNDO TANGO - COMPREHENSIVE TEST SUITE"
echo "   Self-Healing | Mr Blue AI | Gap Analysis"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Step 1: Documentation Gap Analysis
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Documentation Gap Analysis${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if command -v tsx &> /dev/null
then
    echo "Running gap analysis with tsx..."
    tsx scripts/analyze-documentation-gaps.ts
elif command -v ts-node &> /dev/null
then
    echo "Running gap analysis with ts-node..."
    ts-node scripts/analyze-documentation-gaps.ts
else
    echo -e "${YELLOW}⚠️  tsx/ts-node not found. Skipping gap analysis.${NC}"
    echo -e "${YELLOW}   Install with: npm install -g tsx${NC}"
fi

echo ""

# Step 2: Playwright Tests
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Playwright E2E Tests${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Build Playwright command
PLAYWRIGHT_CMD="npx playwright test"

if [ -n "$HEADED_MODE" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --headed"
    echo "Running in HEADED mode (browser visible)"
fi

if [ -n "$DEBUG_MODE" ]; then
    PLAYWRIGHT_CMD="$PLAYWRIGHT_CMD --debug"
    echo "Running in DEBUG mode"
fi

echo "Executing: $PLAYWRIGHT_CMD"
echo ""

# Run Playwright tests
if $PLAYWRIGHT_CMD; then
    echo ""
    echo -e "${GREEN}✅ Tests completed successfully!${NC}"
    TEST_STATUS="success"
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Check reports for details.${NC}"
    TEST_STATUS="failure"
fi

echo ""

# Step 3: Generate Reports
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Generated Reports${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check for generated reports
if [ -f "test-results/documentation-gap-analysis.json" ]; then
    echo -e "${GREEN}✅ Documentation Gap Analysis:${NC}"
    echo "   📄 test-results/documentation-gap-analysis.json"
fi

if [ -f "test-results/mr-blue-reports.json" ]; then
    echo -e "${GREEN}✅ Mr Blue AI Reports:${NC}"
    echo "   💙 test-results/mr-blue-reports.json"
fi

if [ -f "test-results/self-healing-log.json" ]; then
    echo -e "${GREEN}✅ Self-Healing Log:${NC}"
    echo "   🔧 test-results/self-healing-log.json"
fi

if ls test-results/comprehensive-test-report-*.json 1> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Comprehensive Test Report:${NC}"
    echo "   📊 $(ls -t test-results/comprehensive-test-report-*.json | head -1)"
fi

if [ -d "test-results/playwright-report" ]; then
    echo -e "${GREEN}✅ HTML Report:${NC}"
    echo "   🌐 test-results/playwright-report/index.html"
fi

echo ""

# Step 4: Summary and Next Steps
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}SUMMARY & NEXT STEPS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "$TEST_STATUS" = "success" ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review the reports below:${NC}"
fi

echo ""
echo "View detailed results:"
echo "  • HTML Report:  npx playwright show-report"
echo "  • Gap Analysis: cat test-results/documentation-gap-analysis.json | jq"
echo "  • Mr Blue AI:   cat test-results/mr-blue-reports.json | jq"
echo "  • Self-Healing: cat test-results/self-healing-log.json | jq"
echo ""
echo "Run specific tests:"
echo "  • Platform tests:  npx playwright test comprehensive-platform-test-suite.spec.ts"
echo "  • Journey tests:   npx playwright test customer-journey-tests.spec.ts"
echo "  • Single test:     npx playwright test -g \"test name\""
echo ""
echo "Debug options:"
echo "  • UI Mode:    npx playwright test --ui"
echo "  • Headed:     ./tests/run-comprehensive-test-suite.sh --headed"
echo "  • Debug:      ./tests/run-comprehensive-test-suite.sh --debug"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""

# Exit with appropriate code
if [ "$TEST_STATUS" = "success" ]; then
    exit 0
else
    exit 1
fi
