#!/usr/bin/env tsx
// ============================================================================
// PERFORMANCE AUDIT SCRIPT - Mundo Tango
// ============================================================================
// Analyzes bundle size, dependencies, and performance metrics
// Run: tsx scripts/performance-audit.ts
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';

interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface AuditReport {
  timestamp: string;
  bundleSize: {
    client: number;
    server: number;
    total: number;
  };
  dependencies: {
    total: number;
    production: number;
    development: number;
    outdated: string[];
  };
  recommendations: string[];
}

async function getDirectorySize(dirPath: string): Promise<number> {
  if (!fs.existsSync(dirPath)) return 0;
  
  let size = 0;
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      size += await getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }
  
  return size;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function analyzeBundle(): Promise<AuditReport['bundleSize']> {
  const distPath = path.join(process.cwd(), 'dist');
  const clientPath = path.join(distPath, 'public');
  const serverPath = path.join(distPath);
  
  const clientSize = await getDirectorySize(clientPath);
  const serverSize = await getDirectorySize(serverPath) - clientSize;
  
  return {
    client: clientSize,
    server: serverSize,
    total: clientSize + serverSize,
  };
}

function analyzeDependencies(): AuditReport['dependencies'] {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson: PackageInfo = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const prodDeps = Object.keys(packageJson.dependencies || {});
  const devDeps = Object.keys(packageJson.devDependencies || {});
  
  return {
    total: prodDeps.length + devDeps.length,
    production: prodDeps.length,
    development: devDeps.length,
    outdated: [], // Would require npm outdated check
  };
}

function generateRecommendations(
  bundleSize: AuditReport['bundleSize'],
  deps: AuditReport['dependencies']
): string[] {
  const recommendations: string[] = [];
  
  // Bundle size recommendations
  if (bundleSize.client > 2 * 1024 * 1024) {
    recommendations.push(
      `⚠️ Client bundle is ${formatBytes(bundleSize.client)}. Consider code splitting and lazy loading.`
    );
  }
  
  if (bundleSize.total > 5 * 1024 * 1024) {
    recommendations.push(
      `⚠️ Total bundle is ${formatBytes(bundleSize.total)}. Review dependencies and remove unused code.`
    );
  }
  
  // Dependencies recommendations
  if (deps.total > 150) {
    recommendations.push(
      `⚠️ ${deps.total} total dependencies. Audit for unused packages.`
    );
  }
  
  // Always include optimization tips
  recommendations.push('💡 Enable gzip compression in production');
  recommendations.push('💡 Implement CDN for static assets');
  recommendations.push('💡 Use WebP images for better compression');
  recommendations.push('💡 Implement service worker for offline caching');
  
  return recommendations;
}

async function runAudit(): Promise<void> {
  console.log('🔍 Starting performance audit...\n');
  
  const bundleSize = await analyzeBundle();
  const dependencies = analyzeDependencies();
  const recommendations = generateRecommendations(bundleSize, dependencies);
  
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    bundleSize,
    dependencies,
    recommendations,
  };
  
  // Print report
  console.log('📦 Bundle Size Analysis:');
  console.log(`   Client: ${formatBytes(bundleSize.client)}`);
  console.log(`   Server: ${formatBytes(bundleSize.server)}`);
  console.log(`   Total:  ${formatBytes(bundleSize.total)}\n`);
  
  console.log('📚 Dependencies:');
  console.log(`   Production: ${dependencies.production}`);
  console.log(`   Development: ${dependencies.development}`);
  console.log(`   Total: ${dependencies.total}\n`);
  
  console.log('💡 Recommendations:');
  recommendations.forEach(rec => console.log(`   ${rec}`));
  
  // Save report
  const reportPath = path.join(process.cwd(), 'performance-audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✅ Audit complete! Report saved to ${reportPath}`);
}

runAudit().catch(console.error);
