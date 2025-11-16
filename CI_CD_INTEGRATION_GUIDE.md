# CI/CD Integration Guide
## Visual Regression & Accessibility Testing
**Created:** November 16, 2025  
**Testing Framework:** Playwright + axe-core  
**Standards:** MB.MD v8.0

---

## Executive Summary

This guide provides complete CI/CD integration instructions for running visual regression and accessibility tests in automated pipelines (GitHub Actions, GitLab CI, etc.).

**Key Features:**
- ✅ Automated visual regression testing
- ✅ Automated accessibility compliance testing (WCAG 2.1 AA)
- ✅ Screenshot artifact storage
- ✅ Test report generation
- ✅ Fail-fast on critical violations

---

## 1. GitHub Actions Configuration

### File: `.github/workflows/visual-accessibility-tests.yml`

```yaml
name: Visual Regression & Accessibility Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  visual-regression-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run visual regression tests
        run: npx playwright test server/__tests__/visual-regression.test.ts
        continue-on-error: true
      
      - name: Upload screenshots (baseline)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-screenshots-baseline
          path: tests/screenshots/baselines/
          retention-days: 30
      
      - name: Upload screenshots (actual)
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-screenshots-actual
          path: tests/screenshots/actual/
          retention-days: 30
      
      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-screenshots-diff
          path: tests/screenshots/diffs/
          retention-days: 30
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Visual regression detected! Check artifacts for diff images.'
            })

  accessibility-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      
      - name: Run accessibility tests
        run: npx playwright test server/__tests__/accessibility.test.ts
      
      - name: Upload accessibility report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: test-results/
          retention-days: 30
      
      - name: Comment PR with violations
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ Accessibility violations detected! Please fix WCAG 2.1 AA issues.'
            })

  combined-test-report:
    needs: [visual-regression-tests, accessibility-tests]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - name: Download all artifacts
        uses: actions/download-artifact@v4
      
      - name: Generate combined report
        run: |
          echo "# Test Results Summary" > test-summary.md
          echo "" >> test-summary.md
          echo "## Visual Regression Tests" >> test-summary.md
          echo "- Check visual-screenshots-diff artifact for details" >> test-summary.md
          echo "" >> test-summary.md
          echo "## Accessibility Tests" >> test-summary.md
          echo "- Check accessibility-report artifact for details" >> test-summary.md
      
      - name: Upload summary
        uses: actions/upload-artifact@v4
        with:
          name: test-summary
          path: test-summary.md
          retention-days: 30
```

---

## 2. Local Test Execution

### Running Visual Regression Tests Locally

```bash
# Run all visual regression tests
npx playwright test server/__tests__/visual-regression.test.ts

# Run with headed browser (see what's happening)
npx playwright test server/__tests__/visual-regression.test.ts --headed

# Run specific test
npx playwright test server/__tests__/visual-regression.test.ts -g "Home page visual"

# Update baselines (after visual review)
cp tests/screenshots/actual/*.png tests/screenshots/baselines/
```

### Running Accessibility Tests Locally

```bash
# Run all accessibility tests
npx playwright test server/__tests__/accessibility.test.ts

# Run with trace for debugging
npx playwright test server/__tests__/accessibility.test.ts --trace on

# Run specific test
npx playwright test server/__tests__/accessibility.test.ts -g "keyboard navigation"

# Generate HTML report
npx playwright show-report
```

---

## 3. Package.json Script Integration

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:visual": "playwright test server/__tests__/visual-regression.test.ts",
    "test:a11y": "playwright test server/__tests__/accessibility.test.ts",
    "test:visual:update": "npm run test:visual && cp tests/screenshots/actual/*.png tests/screenshots/baselines/",
    "test:ui-quality": "npm run test:visual && npm run test:a11y"
  }
}
```

---

## 4. GitLab CI Configuration

### File: `.gitlab-ci.yml`

```yaml
visual-regression-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npx playwright test server/__tests__/visual-regression.test.ts
  artifacts:
    when: always
    paths:
      - tests/screenshots/baselines/
      - tests/screenshots/actual/
      - tests/screenshots/diffs/
    expire_in: 30 days
  allow_failure: true

accessibility-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npx playwright test server/__tests__/accessibility.test.ts
  artifacts:
    when: always
    paths:
      - test-results/
    expire_in: 30 days
```

---

## 5. Test Configuration Files

### Playwright Config (already exists: `playwright.config.ts`)

Key settings for visual/accessibility tests:

```typescript
export default defineConfig({
  // ... existing config
  
  use: {
    // Full page screenshots for visual regression
    screenshot: 'on',
    
    // Video recording for debugging
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080 }
    },
    
    // Trace for accessibility debugging
    trace: 'on',
  },
  
  // Separate projects for different test types (optional)
  projects: [
    {
      name: 'visual-regression',
      testMatch: '**/visual-regression.test.ts',
    },
    {
      name: 'accessibility',
      testMatch: '**/accessibility.test.ts',
    },
  ],
});
```

---

## 6. Baseline Image Management

### Initial Baseline Creation

On first run, visual regression tests automatically create baseline images:

```bash
npm run test:visual
# Baselines created in tests/screenshots/baselines/
```

### Updating Baselines After Intentional Changes

When you intentionally change UI (new design, layout changes):

```bash
# 1. Run tests (they will fail with visual differences)
npm run test:visual

# 2. Manually review diff images in tests/screenshots/diffs/

# 3. If changes are correct, update baselines
npm run test:visual:update

# 4. Commit new baselines
git add tests/screenshots/baselines/
git commit -m "Update visual regression baselines after UI redesign"
```

### Baseline Storage in Git

**Option 1: Store baselines in Git (recommended for small teams)**
```bash
# Add to .gitignore
tests/screenshots/actual/
tests/screenshots/diffs/

# Keep baselines in Git
git add tests/screenshots/baselines/
```

**Option 2: Store baselines in cloud (recommended for large teams)**
- Use S3, Google Cloud Storage, or artifact storage
- Download baselines before tests in CI
- Reduces Git repository size

---

## 7. Artifact Storage Configuration

### GitHub Actions - Artifact Retention

```yaml
- name: Upload diff images
  uses: actions/upload-artifact@v4
  with:
    name: visual-screenshots-diff-${{ github.sha }}
    path: tests/screenshots/diffs/
    retention-days: 30  # Adjust based on team needs
```

### Accessing Artifacts

1. **GitHub UI:**
   - Go to Actions tab
   - Select workflow run
   - Download artifacts from "Artifacts" section

2. **GitHub CLI:**
   ```bash
   gh run download <run-id> -n visual-screenshots-diff
   ```

3. **GitHub API:**
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/:owner/:repo/actions/artifacts
   ```

---

## 8. Notification Integration

### Slack Notifications

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Visual/Accessibility tests failed on ${{ github.ref }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Test Suite:* Visual Regression & Accessibility\n*Status:* Failed\n*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Email Notifications

GitHub Actions automatically sends email notifications to commit authors on failure.

---

## 9. Performance Optimization

### Parallel Test Execution

```yaml
- name: Run tests in parallel
  run: npx playwright test --workers=4
```

### Caching

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v3
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

### Selective Test Execution

```yaml
# Only run visual tests on UI changes
- name: Check for UI changes
  id: ui_changes
  run: |
    if git diff --name-only HEAD^ HEAD | grep -E '\.(tsx?|css|scss)$'; then
      echo "ui_changed=true" >> $GITHUB_OUTPUT
    fi

- name: Run visual tests
  if: steps.ui_changes.outputs.ui_changed == 'true'
  run: npm run test:visual
```

---

## 10. Debugging Failed Tests

### Visual Regression Failures

1. **Download diff artifacts**
   ```bash
   gh run download <run-id> -n visual-screenshots-diff
   ```

2. **Compare images side-by-side**
   - Open baseline, actual, and diff images
   - Verify changes are unintentional

3. **Fix or update**
   - Fix CSS/layout issues if unintentional
   - Update baselines if intentional

### Accessibility Failures

1. **Review axe-core violations**
   - Check test output for violation details
   - Note impact level (critical, serious, moderate, minor)

2. **Fix violations**
   ```
   [SERIOUS] color-contrast
   Description: Elements must have sufficient color contrast
   Fix: Update CSS color values to meet 4.5:1 ratio
   ```

3. **Re-run tests**
   ```bash
   npm run test:a11y
   ```

---

## 11. Best Practices

### Visual Regression
- ✅ Review all diff images before updating baselines
- ✅ Use consistent viewport sizes across environments
- ✅ Wait for animations/loading states before screenshots
- ✅ Exclude dynamic content (timestamps, random IDs) from comparison
- ✅ Set appropriate diff thresholds (5-10%)

### Accessibility
- ✅ Fix critical and serious violations immediately
- ✅ Test with keyboard-only navigation manually
- ✅ Use real screen readers for thorough testing (NVDA, JAWS, VoiceOver)
- ✅ Include accessibility in code review checklist
- ✅ Run tests on every PR

### CI/CD
- ✅ Run tests on every commit to main/develop
- ✅ Block merges on accessibility test failures
- ✅ Allow visual regression failures with manual review
- ✅ Store artifacts for at least 30 days
- ✅ Set up notifications for test failures

---

## 12. Troubleshooting

### Common Issues

**Issue:** "Baseline not found" on first run  
**Solution:** Baselines are created automatically. Run tests twice.

**Issue:** Visual tests fail in CI but pass locally  
**Solution:** Ensure consistent fonts, viewport, and rendering environment. Use Playwright Docker image.

**Issue:** Accessibility tests timeout  
**Solution:** Increase timeout in playwright.config.ts or optimize page load performance.

**Issue:** Too many false positives in visual tests  
**Solution:** Increase PIXEL_DIFF_THRESHOLD in visual-regression.test.ts (currently 5%).

---

## 13. Quality Gates

### Recommended Quality Gates

```yaml
# Block PR merge on:
- Accessibility: Any WCAG 2.1 AA violations (critical/serious)
- Visual Regression: >10% pixel difference on any page

# Warn on PR:
- Accessibility: Moderate/minor violations
- Visual Regression: 5-10% pixel difference

# Allow with review:
- Visual Regression: <5% pixel difference
```

---

## Appendix: Test Coverage Metrics

**Visual Regression Tests:** 17 total
- Page-level: 5 tests
- Component-level: 3 tests  
- Theme switching: 4 tests
- Responsive design: 4 tests
- User flows: 2 tests

**Accessibility Tests:** 18 total
- WCAG compliance: 6 tests
- Keyboard navigation: 5 tests
- Screen reader support: 6 tests
- Color contrast: 3 tests
- Focus management: 2 tests

**Total Coverage:** 35 automated UI quality tests

---

**Document Version:** 1.0  
**Last Updated:** November 16, 2025  
**Maintained By:** QA Team  
**Review Frequency:** Monthly
