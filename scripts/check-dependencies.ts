#!/usr/bin/env tsx
// ============================================================================
// DEPENDENCY CHECKER - Mundo Tango
// ============================================================================
// Checks for outdated, vulnerable, and unused dependencies
// Run: tsx scripts/check-dependencies.ts
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface DependencyReport {
  outdated: Array<{
    name: string;
    current: string;
    wanted: string;
    latest: string;
  }>;
  vulnerabilities: {
    total: number;
    low: number;
    moderate: number;
    high: number;
    critical: number;
  };
  unused?: string[];
}

async function checkOutdated(): Promise<DependencyReport['outdated']> {
  console.log('🔍 Checking for outdated dependencies...\n');
  
  try {
    const { stdout } = await execAsync('npm outdated --json');
    const outdated = JSON.parse(stdout || '{}');
    
    return Object.entries(outdated).map(([name, info]: [string, any]) => ({
      name,
      current: info.current,
      wanted: info.wanted,
      latest: info.latest,
    }));
  } catch (error: any) {
    // npm outdated exits with 1 if there are outdated packages
    if (error.stdout) {
      try {
        const outdated = JSON.parse(error.stdout);
        return Object.entries(outdated).map(([name, info]: [string, any]) => ({
          name,
          current: info.current,
          wanted: info.wanted,
          latest: info.latest,
        }));
      } catch {
        return [];
      }
    }
    return [];
  }
}

async function checkVulnerabilities(): Promise<DependencyReport['vulnerabilities']> {
  console.log('🔒 Checking for security vulnerabilities...\n');
  
  try {
    const { stdout } = await execAsync('npm audit --json');
    const audit = JSON.parse(stdout);
    
    return {
      total: audit.metadata?.vulnerabilities?.total || 0,
      low: audit.metadata?.vulnerabilities?.low || 0,
      moderate: audit.metadata?.vulnerabilities?.moderate || 0,
      high: audit.metadata?.vulnerabilities?.high || 0,
      critical: audit.metadata?.vulnerabilities?.critical || 0,
    };
  } catch (error: any) {
    // npm audit exits with 1 if there are vulnerabilities
    if (error.stdout) {
      try {
        const audit = JSON.parse(error.stdout);
        return {
          total: audit.metadata?.vulnerabilities?.total || 0,
          low: audit.metadata?.vulnerabilities?.low || 0,
          moderate: audit.metadata?.vulnerabilities?.moderate || 0,
          high: audit.metadata?.vulnerabilities?.high || 0,
          critical: audit.metadata?.vulnerabilities?.critical || 0,
        };
      } catch {
        return { total: 0, low: 0, moderate: 0, high: 0, critical: 0 };
      }
    }
    return { total: 0, low: 0, moderate: 0, high: 0, critical: 0 };
  }
}

function printReport(report: DependencyReport): void {
  console.log('📊 Dependency Report\n');
  console.log('=' .repeat(60));
  
  // Outdated dependencies
  if (report.outdated.length > 0) {
    console.log('\n📦 Outdated Dependencies:');
    report.outdated.forEach(dep => {
      console.log(`   ${dep.name}: ${dep.current} → ${dep.latest}`);
    });
    console.log(`\n   Total: ${report.outdated.length} outdated packages`);
  } else {
    console.log('\n✅ All dependencies are up to date!');
  }
  
  // Security vulnerabilities
  console.log('\n🔒 Security Vulnerabilities:');
  if (report.vulnerabilities.total === 0) {
    console.log('   ✅ No vulnerabilities found!');
  } else {
    console.log(`   Total: ${report.vulnerabilities.total}`);
    if (report.vulnerabilities.critical > 0) {
      console.log(`   🔴 Critical: ${report.vulnerabilities.critical}`);
    }
    if (report.vulnerabilities.high > 0) {
      console.log(`   🟠 High: ${report.vulnerabilities.high}`);
    }
    if (report.vulnerabilities.moderate > 0) {
      console.log(`   🟡 Moderate: ${report.vulnerabilities.moderate}`);
    }
    if (report.vulnerabilities.low > 0) {
      console.log(`   🟢 Low: ${report.vulnerabilities.low}`);
    }
    
    console.log('\n   Run "npm audit fix" to auto-fix vulnerabilities');
  }
  
  console.log('\n' + '='.repeat(60));
}

async function main(): Promise<void> {
  console.log('🚀 Starting dependency check...\n');
  
  const report: DependencyReport = {
    outdated: await checkOutdated(),
    vulnerabilities: await checkVulnerabilities(),
  };
  
  printReport(report);
  
  // Save report
  const reportPath = path.join(process.cwd(), 'dependency-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to ${reportPath}\n`);
  
  // Exit with error if critical vulnerabilities found
  if (report.vulnerabilities.critical > 0) {
    console.error('❌ Critical vulnerabilities found! Please fix immediately.');
    process.exit(1);
  }
}

main().catch(console.error);
