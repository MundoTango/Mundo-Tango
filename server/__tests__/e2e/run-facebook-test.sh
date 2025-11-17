#!/bin/bash

# Facebook Invite Journey E2E Test Runner
# ========================================
# This script helps run the Facebook invite E2E test with proper configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_FILE="server/__tests__/e2e/facebook-invite-journey.test.ts"
MODE="headless"
SPECIFIC_TEST=""

# Function to display help
show_help() {
    echo -e "${BLUE}Facebook Invite Journey E2E Test Runner${NC}"
    echo ""
    echo "Usage: ./run-facebook-test.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -H, --headed            Run in headed mode (show browser)"
    echo "  -d, --debug             Run in debug mode (step through)"
    echo "  -a, --alternative       Run alternative test (skip Facebook)"
    echo "  -s, --screenshot        View screenshots after test"
    echo "  -c, --clean             Clean screenshots before running"
    echo ""
    echo "Environment Variables:"
    echo "  FACEBOOK_EMAIL          Facebook login email (default: sboddye@gmail.com)"
    echo "  FACEBOOK_PASSWORD       Facebook password (REQUIRED for full test)"
    echo "  MT_TEST_EMAIL          Mundo Tango email (default: scott@boddye.com)"
    echo "  MT_TEST_PASSWORD       Mundo Tango password (default: admin123)"
    echo ""
    echo "Examples:"
    echo "  ./run-facebook-test.sh --headed"
    echo "  ./run-facebook-test.sh --debug"
    echo "  ./run-facebook-test.sh --alternative"
    echo "  FACEBOOK_PASSWORD=mypass ./run-facebook-test.sh --headed"
    echo ""
}

# Function to check if Playwright is installed
check_playwright() {
    if ! command -v npx &> /dev/null; then
        echo -e "${RED}✗ npx not found. Please install Node.js${NC}"
        exit 1
    fi
    
    if ! npx playwright --version &> /dev/null; then
        echo -e "${YELLOW}⚠ Playwright not found. Installing...${NC}"
        npm install
    fi
}

# Function to load environment variables
load_env() {
    if [ -f "server/__tests__/e2e/.env.test" ]; then
        echo -e "${GREEN}✓ Loading environment from .env.test${NC}"
        export $(cat server/__tests__/e2e/.env.test | grep -v '^#' | xargs)
    fi
}

# Function to clean screenshots
clean_screenshots() {
    echo -e "${YELLOW}🧹 Cleaning screenshots directory...${NC}"
    rm -rf /tmp/screenshots/*.png
    echo -e "${GREEN}✓ Screenshots cleaned${NC}"
}

# Function to view screenshots
view_screenshots() {
    if [ -d "/tmp/screenshots" ] && [ "$(ls -A /tmp/screenshots)" ]; then
        echo -e "${BLUE}📸 Screenshots saved:${NC}"
        ls -lh /tmp/screenshots/*.png 2>/dev/null || echo "No screenshots found"
        echo ""
        echo -e "${YELLOW}To view screenshots:${NC}"
        echo "  open /tmp/screenshots/    # macOS"
        echo "  xdg-open /tmp/screenshots/ # Linux"
    else
        echo -e "${YELLOW}⚠ No screenshots found${NC}"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -H|--headed)
            MODE="headed"
            shift
            ;;
        -d|--debug)
            MODE="debug"
            shift
            ;;
        -a|--alternative)
            SPECIFIC_TEST="-g Alternative"
            shift
            ;;
        -s|--screenshot)
            view_screenshots
            exit 0
            ;;
        -c|--clean)
            clean_screenshots
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Print header
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Facebook Invite Journey E2E Test                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
check_playwright
load_env

# Check Facebook credentials
if [ -z "$FACEBOOK_PASSWORD" ] && [ -z "$SPECIFIC_TEST" ]; then
    echo -e "${YELLOW}⚠ Warning: FACEBOOK_PASSWORD not set${NC}"
    echo -e "${YELLOW}  Full E2E test will be skipped${NC}"
    echo -e "${YELLOW}  To run full test, set FACEBOOK_PASSWORD:${NC}"
    echo -e "    export FACEBOOK_PASSWORD=your_password"
    echo -e "  Or run alternative test:${NC}"
    echo -e "    ./run-facebook-test.sh --alternative"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Ensure screenshots directory exists
mkdir -p /tmp/screenshots

# Print configuration
echo -e "${GREEN}✓ Configuration:${NC}"
echo -e "  Mode: ${BLUE}${MODE}${NC}"
echo -e "  Test: ${BLUE}${SPECIFIC_TEST:-Full E2E Journey}${NC}"
echo -e "  Facebook Email: ${BLUE}${FACEBOOK_EMAIL:-sboddye@gmail.com}${NC}"
echo -e "  MT Email: ${BLUE}${MT_TEST_EMAIL:-scott@boddye.com}${NC}"
echo -e "  Screenshots: ${BLUE}/tmp/screenshots${NC}"
echo ""

# Build command
CMD="npx playwright test ${TEST_FILE}"

if [ "$MODE" = "headed" ]; then
    CMD="${CMD} --headed"
elif [ "$MODE" = "debug" ]; then
    CMD="${CMD} --debug"
fi

if [ -n "$SPECIFIC_TEST" ]; then
    CMD="${CMD} ${SPECIFIC_TEST}"
fi

# Run test
echo -e "${YELLOW}🚀 Running test...${NC}"
echo -e "${BLUE}Command: ${CMD}${NC}"
echo ""

$CMD

# Check test result
TEST_RESULT=$?

echo ""
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ TEST PASSED                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ TEST FAILED                                        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
view_screenshots

exit $TEST_RESULT
