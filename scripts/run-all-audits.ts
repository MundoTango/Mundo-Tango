#!/usr/bin/env tsx
// ============================================================================
// RUN ALL AUDITS - Mundo Tango
// ============================================================================
// Executes all audit scripts in sequence
// Run: tsx scripts/run-all-audits.ts
// ============================================================================

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface AuditResult {
  name: string;
  success: boolean;
  output: string;
  duration: number;
}

async function runAudit(name: string, command: string): Promise<AuditResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 Running: ${name}`);
  console.log('='.repeat(60));
  
  const startTime = Date.now();
  
  try {
    const { stdout, stderr } = await execAsync(command);
    const duration = Date.now() - startTime;
    
    console.log(stdout);
    if (stderr) console.warn(stderr);
    
    return {
      name,
      success: true,
      output: stdout,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ Error in ${name}:`, error.message);
    
    return {
      name,
      success: false,
      output: error.message,
      duration,
    };
  }
}

async function main(): Promise<void> {
  console.log('🚀 Mundo Tango - Complete Audit Suite\n');
  console.log('Running all audits in sequence...\n');
  
  const audits = [
    {
      name: 'Dependency Check',
      command: 'tsx scripts/check-dependencies.ts',
    },
    {
      name: 'Performance Audit',
      command: 'tsx scripts/performance-audit.ts',
    },
    {
      name: 'Mobile Responsiveness Audit',
      command: 'tsx scripts/mobile-responsive-audit.ts',
    },
    {
      name: 'SEO Generator',
      command: 'tsx scripts/seo-generator.ts',
    },
  ];
  
  const results: AuditResult[] = [];
  
  for (const audit of audits) {
    const result = await runAudit(audit.name, audit.command);
    results.push(result);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const duration = (result.duration / 1000).toFixed(2);
    console.log(`${status} ${result.name} (${duration}s)`);
  });
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.length} audits`);
  console.log(`Success: ${successCount} ✅`);
  console.log(`Failed: ${failCount} ❌`);
  console.log('='.repeat(60));
  
  if (failCount > 0) {
    console.error('\n⚠️ Some audits failed. Review the output above.');
    process.exit(1);
  } else {
    console.log('\n✅ All audits completed successfully!');
  }
}

main();
