#!/bin/bash

# Agent Rollup System Test Script
# Tests all endpoints of the Phase 0B Agent Intelligence Rollup system

BASE_URL="http://localhost:5000/api/agent-rollup"

echo "============================================"
echo "Agent Rollup System Test"
echo "============================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "-------------------"
curl -s "$BASE_URL/health" | head -10
echo -e "\n"

# Test 2: Get Status
echo "Test 2: Get Service Status"
echo "-------------------------"
curl -s "$BASE_URL/status" | head -10
echo -e "\n"

# Test 3: Get Statistics
echo "Test 3: Get Intelligence Base Statistics"
echo "---------------------------------------"
curl -s "$BASE_URL/stats" | head -10
echo -e "\n"

# Test 4: Get Agent Snapshots
echo "Test 4: Get Agent Snapshots"
echo "--------------------------"
curl -s "$BASE_URL/agents" | head -10
echo -e "\n"

# Test 5: Search Knowledge (requires query param)
echo "Test 5: Search Knowledge Base"
echo "----------------------------"
curl -s "$BASE_URL/knowledge?query=tango&limit=5" | head -10
echo -e "\n"

# Test 6: Get Patterns
echo "Test 6: Detect Cross-Agent Patterns"
echo "----------------------------------"
curl -s "$BASE_URL/patterns" | head -10
echo -e "\n"

# Test 7: Get Conflicts
echo "Test 7: Detect Knowledge Conflicts"
echo "---------------------------------"
curl -s "$BASE_URL/conflicts" | head -10
echo -e "\n"

echo "============================================"
echo "All read-only tests completed!"
echo "============================================"
echo ""
echo "To test rollup triggers (POST endpoints):"
echo "1. Get CSRF token: curl http://localhost:5000/api/csrf-token"
echo "2. Use token in POST request header"
echo ""
echo "Example POST endpoints:"
echo "- POST $BASE_URL/trigger"
echo "- POST $BASE_URL/trigger/discovery"
echo "- POST $BASE_URL/trigger/page-completion"
echo "- POST $BASE_URL/trigger/critical-event"
echo ""
