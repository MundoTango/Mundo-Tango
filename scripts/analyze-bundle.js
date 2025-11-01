#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes webpack bundle size and composition
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 Starting bundle analysis...\n');

// Build the production bundle
console.log('🔨 Building production bundle...');
try {
  execSync('npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Analyze the bundle
console.log('\n📈 Generating bundle analysis report...');

const distPath = path.join(__dirname, '../dist');
const statsPath = path.join(distPath, 'client');

if (!fs.existsSync(statsPath)) {
  console.error('❌ Build output not found');
  process.exit(1);
}

// Get file sizes
const files = fs.readdirSync(statsPath);
const jsFiles = files.filter(f => f.endsWith('.js'));
const cssFiles = files.filter(f => f.endsWith('.css'));

console.log('\n📦 Bundle Summary:');
console.log('─'.repeat(60));

let totalSize = 0;

jsFiles.forEach(file => {
  const filePath = path.join(statsPath, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalSize += stats.size;
  console.log(`  JS:  ${file.padEnd(40)} ${sizeKB.padStart(10)} KB`);
});

cssFiles.forEach(file => {
  const filePath = path.join(statsPath, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalSize += stats.size;
  console.log(`  CSS: ${file.padEnd(40)} ${sizeKB.padStart(10)} KB`);
});

console.log('─'.repeat(60));
console.log(`  TOTAL: ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

// Performance recommendations
console.log('\n💡 Recommendations:');
if (totalSize > 5 * 1024 * 1024) {
  console.log('  ⚠️  Bundle is large (>5MB). Consider:');
  console.log('     - More aggressive code splitting');
  console.log('     - Tree shaking unused dependencies');
  console.log('     - Lazy loading heavy components');
} else if (totalSize > 2 * 1024 * 1024) {
  console.log('  ✅ Bundle size is acceptable (2-5MB)');
  console.log('     - Continue monitoring as features are added');
} else {
  console.log('  🎉 Excellent bundle size (<2MB)!');
}

console.log('\n✅ Analysis complete!');
console.log('📁 Full report: Open dist/client/stats.html\n');
