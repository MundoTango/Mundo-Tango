/**
 * TEST: Unified Mr. Blue Chat Integration
 * MB.MD Pattern 97 - Verification test
 *
 * Run with: npx tsx server/tests/unified-mrblue-test.ts
 */

import { MR_BLUE_TOOLS, getToolsForUser, type MrBlueToolName } from '../services/MrBlueToolSchemas';
import { vibeCodingToolService } from '../services/VibeCodingToolService';

async function runTests() {
  console.log('='.repeat(60));
  console.log('UNIFIED MR. BLUE CHAT - INTEGRATION TEST');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Tool schemas are defined
  console.log('\n[TEST 1] Tool schemas defined');
  try {
    if (MR_BLUE_TOOLS.length === 10) {
      console.log(`  ✅ PASS: ${MR_BLUE_TOOLS.length} tools defined`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: Expected 10 tools, got ${MR_BLUE_TOOLS.length}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 2: Tool access by role level
  console.log('\n[TEST 2] Tool access by role level');
  try {
    const godTools = getToolsForUser(8);
    const eliteTools = getToolsForUser(6);
    const regularTools = getToolsForUser(1);

    if (godTools.length === 10 && eliteTools.length === 6 && regularTools.length === 0) {
      console.log(`  ✅ PASS: God=10, Elite=6, Regular=0 tools`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: God=${godTools.length}, Elite=${eliteTools.length}, Regular=${regularTools.length}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 3: Tool intent detection
  console.log('\n[TEST 3] Tool intent detection');
  try {
    const tests = [
      { msg: 'read package.json', expectedTool: 'readFile' },
      { msg: 'git status', expectedTool: 'getGitStatus' },
      { msg: 'search for authenticateToken in codebase', expectedTool: 'grepFiles' },
      { msg: 'list directory server', expectedTool: 'listDirectory' },
      { msg: 'show my github', expectedTool: 'getGitHubInfo' },
    ];

    let allPassed = true;
    for (const test of tests) {
      const result = vibeCodingToolService.detectToolIntent(test.msg);
      if (result.suggestedTool === test.expectedTool) {
        console.log(`  ✅ "${test.msg}" → ${result.suggestedTool}`);
      } else {
        console.log(`  ❌ "${test.msg}" → ${result.suggestedTool} (expected: ${test.expectedTool})`);
        allPassed = false;
      }
    }

    if (allPassed) {
      passed++;
    } else {
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 4: Tool execution - readFile
  console.log('\n[TEST 4] Tool execution - readFile');
  try {
    const result = await vibeCodingToolService.executeTool('readFile', { filePath: 'package.json' });
    if (result.success && result.data?.content?.includes('name')) {
      console.log(`  ✅ PASS: Read package.json (${result.data.lines} lines)`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${result.error || 'No content'}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 5: Tool execution - listDirectory
  console.log('\n[TEST 5] Tool execution - listDirectory');
  try {
    const result = await vibeCodingToolService.executeTool('listDirectory', { dirPath: 'server/services/mrBlue' });
    if (result.success && result.data?.entries?.length > 0) {
      console.log(`  ✅ PASS: Listed ${result.data.entries.length} items in mrBlue`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${result.error || 'No entries'}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 6: Tool execution - grepFiles
  console.log('\n[TEST 6] Tool execution - grepFiles');
  try {
    const result = await vibeCodingToolService.executeTool('grepFiles', { searchTerm: 'UnifiedMrBlueChat' });
    if (result.success && result.data?.count > 0) {
      console.log(`  ✅ PASS: Found ${result.data.count} file(s) containing "UnifiedMrBlueChat"`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${result.error || 'No matches'}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Test 7: Tool execution - getGitStatus
  console.log('\n[TEST 7] Tool execution - getGitStatus');
  try {
    const result = await vibeCodingToolService.executeTool('getGitStatus', {});
    if (result.success && result.data?.branch) {
      console.log(`  ✅ PASS: Branch "${result.data.branch}", ${result.data.status?.length || 0} changes`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${result.error || 'No branch'}`);
      failed++;
    }
  } catch (e: any) {
    console.log(`  ❌ FAIL: ${e.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
