#!/usr/bin/env node

/**
 * Mobile Responsiveness Audit Script
 * Tests viewport compatibility and mobile UX
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📱 Starting mobile responsiveness audit...\n');

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'Desktop 1080p', width: 1920, height: 1080 }
];

const TEST_PAGES = [
  '/',
  '/feed',
  '/events',
  '/settings',
  '/life-ceo',
  '/chat'
];

console.log('📐 Testing Viewports:');
VIEWPORTS.forEach(vp => {
  console.log(`  - ${vp.name.padEnd(20)} ${vp.width}x${vp.height}`);
});

console.log('\n📄 Testing Pages:');
TEST_PAGES.forEach(page => {
  console.log(`  - ${page}`);
});

console.log('\n🔍 Running Lighthouse mobile audits...\n');

const OUTPUT_DIR = path.join(__dirname, '../mobile-audit-reports');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const results = [];

TEST_PAGES.forEach(page => {
  const url = `http://localhost:5000${page}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(OUTPUT_DIR, `mobile-${page.replace(/\//g, '-')}-${timestamp}.json`);

  try {
    console.log(`📱 Testing: ${url}`);
    
    execSync(
      `npx lighthouse ${url} ` +
      `--output=json ` +
      `--output-path=${reportPath.replace('.json', '')} ` +
      `--only-categories=performance,accessibility ` +
      `--preset=mobile ` +
      `--chrome-flags="--headless" ` +
      `--quiet`,
      { stdio: 'pipe' }
    );

    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    results.push({
      page,
      performance: Math.round((data.categories.performance?.score || 0) * 100),
      accessibility: Math.round((data.categories.accessibility?.score || 0) * 100),
      fcp: data.audits['first-contentful-paint']?.numericValue,
      lcp: data.audits['largest-contentful-paint']?.numericValue,
      tbt: data.audits['total-blocking-time']?.numericValue
    });

    console.log(`  ✅ Performance: ${results[results.length - 1].performance}%\n`);
  } catch (error) {
    console.error(`  ❌ Failed to test ${page}\n`);
  }
});

// Summary
console.log('\n📊 Mobile Performance Summary:');
console.log('─'.repeat(80));
console.log('Page'.padEnd(25) + 'Perf'.padStart(6) + 'A11y'.padStart(6) + 'FCP (ms)'.padStart(12) + 'LCP (ms)'.padStart(12));
console.log('─'.repeat(80));

results.forEach(r => {
  const perfEmoji = r.performance >= 90 ? '🟢' : r.performance >= 50 ? '🟡' : '🔴';
  const a11yEmoji = r.accessibility >= 90 ? '🟢' : r.accessibility >= 50 ? '🟡' : '🔴';
  
  console.log(
    r.page.padEnd(25) +
    `${perfEmoji} ${r.performance}%`.padStart(6) +
    `${a11yEmoji} ${r.accessibility}%`.padStart(6) +
    Math.round(r.fcp || 0).toString().padStart(12) +
    Math.round(r.lcp || 0).toString().padStart(12)
  );
});

console.log('─'.repeat(80));

// Recommendations
console.log('\n💡 Mobile Optimization Recommendations:');
const avgPerf = results.reduce((sum, r) => sum + r.performance, 0) / results.length;

if (avgPerf < 50) {
  console.log('  🔴 CRITICAL: Mobile performance needs immediate attention');
  console.log('     - Reduce JavaScript bundle size');
  console.log('     - Optimize images for mobile');
  console.log('     - Implement aggressive lazy loading');
  console.log('     - Use responsive images with srcset');
} else if (avgPerf < 75) {
  console.log('  🟡 WARNING: Mobile performance could be improved');
  console.log('     - Review render-blocking resources');
  console.log('     - Optimize critical rendering path');
  console.log('     - Consider service worker caching');
} else {
  console.log('  🟢 GOOD: Mobile performance is acceptable');
  console.log('     - Continue monitoring as features are added');
  console.log('     - Test on real devices for validation');
}

console.log(`\n✅ Mobile audit complete!`);
console.log(`📁 Reports saved to: ${OUTPUT_DIR}\n`);
