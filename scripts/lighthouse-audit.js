#!/usr/bin/env node

/**
 * Lighthouse Performance Audit Script
 * Runs automated performance, accessibility, SEO, and PWA audits
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💡 Starting Lighthouse audit...\n');

const AUDIT_URL = process.env.AUDIT_URL || 'http://localhost:5000';
const OUTPUT_DIR = path.join(__dirname, '../lighthouse-reports');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(OUTPUT_DIR, `report-${timestamp}.html`);
const jsonPath = path.join(OUTPUT_DIR, `report-${timestamp}.json`);

console.log(`🎯 Auditing: ${AUDIT_URL}`);
console.log(`📁 Output: ${reportPath}\n`);

try {
  // Run Lighthouse
  execSync(
    `npx lighthouse ${AUDIT_URL} ` +
    `--output=html,json ` +
    `--output-path=${reportPath.replace('.html', '')} ` +
    `--chrome-flags="--headless" ` +
    `--quiet`,
    { stdio: 'inherit' }
  );

  // Read JSON results
  const results = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const categories = results.categories;

  console.log('\n📊 Lighthouse Scores:');
  console.log('─'.repeat(50));
  
  const scores = {
    'Performance': categories.performance?.score,
    'Accessibility': categories.accessibility?.score,
    'Best Practices': categories['best-practices']?.score,
    'SEO': categories.seo?.score,
    'PWA': categories.pwa?.score
  };

  Object.entries(scores).forEach(([category, score]) => {
    if (score !== undefined) {
      const percentage = Math.round(score * 100);
      const emoji = percentage >= 90 ? '🟢' : percentage >= 50 ? '🟡' : '🔴';
      console.log(`  ${emoji} ${category.padEnd(20)} ${percentage}%`);
    }
  });

  console.log('─'.repeat(50));

  // Performance metrics
  const metrics = results.audits['metrics']?.details?.items?.[0];
  if (metrics) {
    console.log('\n⚡ Core Web Vitals:');
    console.log(`  FCP (First Contentful Paint):     ${metrics.firstContentfulPaint}ms`);
    console.log(`  LCP (Largest Contentful Paint):   ${metrics.largestContentfulPaint}ms`);
    console.log(`  TBT (Total Blocking Time):        ${metrics.totalBlockingTime}ms`);
    console.log(`  CLS (Cumulative Layout Shift):    ${metrics.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`  Speed Index:                      ${metrics.speedIndex}ms`);
  }

  console.log(`\n✅ Audit complete!`);
  console.log(`📄 HTML Report: ${reportPath}`);
  console.log(`📊 JSON Data: ${jsonPath}\n`);

} catch (error) {
  console.error('\n❌ Lighthouse audit failed');
  console.error(error.message);
  process.exit(1);
}
