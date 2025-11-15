# Performance Testing Guide

**Platform:** Mundo Tango  
**Version:** 1.0  
**Last Updated:** November 15, 2025

## Overview

This guide explains how to run performance benchmarks for the Mundo Tango platform, specifically validating metrics for Mr. Blue AI companion and Visual Editor features.

## Prerequisites

- Node.js 20+ installed
- Application built and running
- Server running on `http://localhost:5000`
- At least 8GB RAM available
- Chrome/Chromium browser installed

## Test Suite Components

### 1. Bundle Size Analysis

**Purpose:** Analyze production bundle size and identify optimization opportunities.

**Script:** `scripts/bundle-analysis.sh`

**How to Run:**
```bash
# Make script executable (first time only)
chmod +x scripts/bundle-analysis.sh

# Run bundle analysis
./scripts/bundle-analysis.sh
```

**What it does:**
1. Builds production bundle via `npm run build`
2. Calculates total bundle size
3. Lists top 10 largest JavaScript chunks
4. Checks main bundle against 500KB target
5. Generates `reports/performance-bundle.md`

**Expected Output:**
```
📦 Analyzing bundle size...
Total bundle size: 79M
Largest chunks:
3.8M  dist/public/assets/index-7jp3FIsI.js
632K  dist/public/assets/CodePreview-FKbHGZgK.js
...
⚠️ Main bundle exceeds 500KB target
✅ Bundle analysis complete
```

**Output Files:**
- `reports/performance-bundle.md` - Detailed analysis report
- `reports/bundle-size.txt` - Raw bundle data

---

### 2. Lighthouse Audits

**Purpose:** Measure frontend performance, accessibility, best practices, and SEO scores.

**Script:** `scripts/lighthouse-audit.sh`

**How to Run:**
```bash
# Ensure application is running first
npm run dev

# In another terminal, run Lighthouse
chmod +x scripts/lighthouse-audit.sh
./scripts/lighthouse-audit.sh
```

**Configuration:** `lighthouserc.json`

**What it does:**
1. Installs Lighthouse CLI if needed
2. Runs 3 audits on `/mr-blue` route
3. Runs 3 audits on `/visual-editor` route
4. Generates HTML reports

**Target Pages:**
- `http://localhost:5000/mr-blue` - Mr. Blue AI interface
- `http://localhost:5000/visual-editor` - Visual Editor interface

**Metrics Evaluated:**
- **Performance:** Page load speed, TTI, FCP, LCP
- **Accessibility:** WCAG compliance, ARIA labels, color contrast
- **Best Practices:** HTTPS, console errors, deprecated APIs
- **SEO:** Meta tags, structured data, mobile-friendly

**Passing Criteria:**
- Performance: ≥80/100
- Accessibility: ≥90/100
- Best Practices: ≥80/100
- SEO: ≥80/100

**Output Files:**
- `reports/lighthouse-mr-blue.html`
- `reports/lighthouse-visual-editor.html`

**View Results:**
```bash
# Open in browser
open reports/lighthouse-mr-blue.html
open reports/lighthouse-visual-editor.html
```

---

### 3. API Latency Tests

**Purpose:** Measure API endpoint response times and identify slow endpoints.

**Script:** `scripts/api-latency-test.ts`

**How to Run:**
```bash
# Ensure application is running first
npm run dev

# In another terminal, run latency tests
tsx scripts/api-latency-test.ts
```

**What it does:**
1. Tests 4 key API endpoints
2. Makes 10 requests per endpoint
3. Calculates average, p50, p95, p99 latencies
4. Identifies endpoints exceeding 500ms p95 target

**Endpoints Tested:**
- `GET /api/posts` - Social feed posts
- `GET /api/auth/me` - Current user info
- `GET /api/mrblue/conversations` - AI conversation history
- `GET /api/community/global-stats` - Community statistics

**Expected Output:**
```
Testing http://localhost:5000/api/posts...
Testing http://localhost:5000/api/auth/me...
...

📊 API Latency Report

┌─────────┬──────────────────────────────────────────┬────────┬────────────┬─────┬─────┬─────┐
│ (index) │ endpoint                                 │ method │ avgLatency │ p50 │ p95 │ p99 │
├─────────┼──────────────────────────────────────────┼────────┼────────────┼─────┼─────┼─────┤
│ 0       │ 'http://localhost:5000/api/posts'        │ 'GET'  │ 45.2       │ 42  │ 78  │ 95  │
│ 1       │ 'http://localhost:5000/api/auth/me'      │ 'GET'  │ 23.8       │ 22  │ 35  │ 42  │
└─────────┴──────────────────────────────────────────┴────────┴────────────┴─────┴─────┴─────┘

✅ All endpoints within latency targets
```

**Passing Criteria:**
- All endpoints: p95 < 500ms
- Critical endpoints (/auth/me): p95 < 100ms

---

## Complete Test Run

To run all tests in sequence:

```bash
# 1. Build and analyze bundle
./scripts/bundle-analysis.sh

# 2. Start application
npm run dev &
APP_PID=$!

# 3. Wait for app to start
sleep 10

# 4. Run Lighthouse audits
./scripts/lighthouse-audit.sh

# 5. Run API latency tests
tsx scripts/api-latency-test.ts

# 6. Stop application
kill $APP_PID

# 7. Review all reports
ls -lh reports/
```

## Interpreting Results

### Bundle Size
- **< 500KB:** ✅ Pass
- **500KB - 1MB:** ⚠️ Warning - Optimize recommended
- **> 1MB:** ❌ Fail - Critical optimization required

### Lighthouse Scores
- **90-100:** ✅ Excellent
- **80-89:** ✅ Good
- **70-79:** ⚠️ Fair - Improvements recommended
- **< 70:** ❌ Poor - Immediate action required

### API Latency
- **p95 < 100ms:** ✅ Excellent
- **p95 100-300ms:** ✅ Good
- **p95 300-500ms:** ⚠️ Fair
- **p95 > 500ms:** ❌ Poor

## Continuous Monitoring

### During Development
```bash
# Quick bundle check
npm run build && du -sh dist/

# Quick API test (single endpoint)
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:5000/api/posts
```

### Before Each Release
1. Run full test suite
2. Compare against baseline metrics
3. Update `reports/performance.md`
4. Document any regressions
5. Implement fixes before merge

## Troubleshooting

### Bundle Analysis Fails
```bash
# Clear build cache
rm -rf dist/
npm run build
```

### Lighthouse Fails to Connect
```bash
# Check app is running
curl http://localhost:5000/mr-blue

# Try with different port
npx lighthouse http://localhost:5000/mr-blue --port=9222
```

### API Tests Timeout
```bash
# Increase timeout in script
# Edit scripts/api-latency-test.ts
# Change iterations from 10 to 5
```

## Performance Targets Summary

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Main Bundle | < 500KB | 3876KB | ❌ |
| Lighthouse (Performance) | ≥ 80 | TBD | ⏳ |
| Lighthouse (Accessibility) | ≥ 90 | TBD | ⏳ |
| API p95 Latency | < 500ms | TBD | ⏳ |
| WebSocket Uptime | > 95% | TBD | ⏳ |

## Next Steps

1. ✅ Bundle analysis complete - **CRITICAL ISSUES FOUND**
2. ⏳ Run Lighthouse audits
3. ⏳ Run API latency tests
4. ⏳ Update performance.md with all results
5. ⏳ Create optimization action plan

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Vite Bundle Optimization](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Performance Budget](https://web.dev/performance-budgets-101/)
