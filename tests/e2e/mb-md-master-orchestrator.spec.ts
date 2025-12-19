import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

test.describe('MB.MD Master Test Orchestrator', () => {
  const testSuites = [
    {
      name: 'Auth Token Tests',
      file: 'tests/e2e/mb-md-auth-token-suite.spec.ts',
      expectedTests: 15,
      priority: 'critical'
    },
    {
      name: 'WebSocket Tests',
      file: 'tests/e2e/mb-md-websocket-suite.spec.ts',
      expectedTests: 12,
      priority: 'critical'
    },
    {
      name: 'Chat Routing Tests',
      file: 'tests/e2e/mb-md-chat-routing-suite.spec.ts',
      expectedTests: 18,
      priority: 'critical'
    },
    {
      name: 'Voice System Tests',
      file: 'tests/e2e/mb-md-voice-system-suite.spec.ts',
      expectedTests: 14,
      priority: 'high'
    },
    {
      name: 'Integration Tests',
      file: 'tests/e2e/mb-md-integration-suite.spec.ts',
      expectedTests: 8,
      priority: 'critical'
    }
  ];

  interface TestSuiteResult {
    suite: string;
    passed: number;
    failed: number;
    total: number;
    bugs: string[];
    duration: number;
  }

  interface OrchestrationReport {
    timestamp: string;
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    suiteResults: TestSuiteResult[];
    allBugReports: string[];
    recommendations: string[];
    nextSteps: string[];
  }

  test('ORCHESTRATOR-01: Verify all test suite files exist', async ({}) => {
    const missingFiles: string[] = [];
    
    for (const suite of testSuites) {
      const filePath = path.join(process.cwd(), suite.file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(suite.file);
      }
    }
    
    expect(missingFiles).toEqual([]);
  });

  test('ORCHESTRATOR-02: Verify bug reporting infrastructure exists', async ({}) => {
    const helperPath = path.join(process.cwd(), 'tests/e2e/helpers/bug-reporter.ts');
    expect(fs.existsSync(helperPath)).toBeTruthy();
    
    const bugReportsDir = path.join(process.cwd(), 'test-results', 'bug-reports');
    if (!fs.existsSync(bugReportsDir)) {
      fs.mkdirSync(bugReportsDir, { recursive: true });
    }
    
    expect(fs.existsSync(bugReportsDir)).toBeTruthy();
  });

  test('ORCHESTRATOR-03: Run Auth Token Suite and collect results', async ({}) => {
    const results = await runTestSuite('Auth Token Tests', testSuites[0].file);
    
    console.log('\n=== Auth Token Suite Results ===');
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`Bug Reports: ${results.bugs.length}`);
    
    savePartialReport('auth-suite', results);
  });

  test('ORCHESTRATOR-04: Run WebSocket Suite and collect results', async ({}) => {
    const results = await runTestSuite('WebSocket Tests', testSuites[1].file);
    
    console.log('\n=== WebSocket Suite Results ===');
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`Bug Reports: ${results.bugs.length}`);
    
    savePartialReport('websocket-suite', results);
  });

  test('ORCHESTRATOR-05: Run Chat Routing Suite and collect results', async ({}) => {
    const results = await runTestSuite('Chat Routing Tests', testSuites[2].file);
    
    console.log('\n=== Chat Routing Suite Results ===');
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`Bug Reports: ${results.bugs.length}`);
    
    savePartialReport('chat-routing-suite', results);
  });

  test('ORCHESTRATOR-06: Run Voice System Suite and collect results', async ({}) => {
    const results = await runTestSuite('Voice System Tests', testSuites[3].file);
    
    console.log('\n=== Voice System Suite Results ===');
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`Bug Reports: ${results.bugs.length}`);
    
    savePartialReport('voice-system-suite', results);
  });

  test('ORCHESTRATOR-07: Run Integration Suite and collect results', async ({}) => {
    const results = await runTestSuite('Integration Tests', testSuites[4].file);
    
    console.log('\n=== Integration Suite Results ===');
    console.log(`Passed: ${results.passed}/${results.total}`);
    console.log(`Failed: ${results.failed}/${results.total}`);
    console.log(`Bug Reports: ${results.bugs.length}`);
    
    savePartialReport('integration-suite', results);
  });

  test('ORCHESTRATOR-08: Generate comprehensive orchestration report', async ({}) => {
    const partialReports = loadAllPartialReports();
    const allBugReports = loadAllBugReports();
    
    const orchestrationReport: OrchestrationReport = {
      timestamp: new Date().toISOString(),
      totalTests: 0,
      totalPassed: 0,
      totalFailed: 0,
      suiteResults: partialReports,
      allBugReports: allBugReports,
      recommendations: [],
      nextSteps: []
    };
    
    partialReports.forEach(result => {
      orchestrationReport.totalTests += result.total;
      orchestrationReport.totalPassed += result.passed;
      orchestrationReport.totalFailed += result.failed;
    });
    
    orchestrationReport.recommendations = generateRecommendations(partialReports, allBugReports);
    orchestrationReport.nextSteps = generateNextSteps(partialReports);
    
    const reportPath = path.join(process.cwd(), 'test-results', 'MB-MD-ORCHESTRATION-REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(orchestrationReport, null, 2));
    
    const summaryPath = path.join(process.cwd(), 'test-results', 'MB-MD-ORCHESTRATION-SUMMARY.md');
    const summary = generateMarkdownSummary(orchestrationReport);
    fs.writeFileSync(summaryPath, summary);
    
    console.log('\n========================================');
    console.log('MB.MD MASTER TEST ORCHESTRATOR SUMMARY');
    console.log('========================================\n');
    console.log(`Total Tests: ${orchestrationReport.totalTests}`);
    console.log(`Passed: ${orchestrationReport.totalPassed} (${Math.round(orchestrationReport.totalPassed / orchestrationReport.totalTests * 100)}%)`);
    console.log(`Failed: ${orchestrationReport.totalFailed} (${Math.round(orchestrationReport.totalFailed / orchestrationReport.totalTests * 100)}%)`);
    console.log(`Bug Reports Generated: ${allBugReports.length}`);
    console.log(`\nFull Report: ${reportPath}`);
    console.log(`Summary: ${summaryPath}\n`);
    
    expect(orchestrationReport.totalTests).toBe(67);
  });

  async function runTestSuite(suiteName: string, suiteFile: string): Promise<TestSuiteResult> {
    const startTime = Date.now();
    
    try {
      const command = `npx playwright test ${suiteFile} --reporter=json`;
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      const result = JSON.parse(output);
      const duration = Date.now() - startTime;
      
      return {
        suite: suiteName,
        passed: result.stats?.passed || 0,
        failed: result.stats?.failed || 0,
        total: result.stats?.total || 0,
        bugs: getBugReportsForSuite(suiteName),
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      try {
        const errorOutput = error.stdout || error.stderr || '';
        const jsonMatch = errorOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            suite: suiteName,
            passed: result.stats?.passed || 0,
            failed: result.stats?.failed || 0,
            total: result.stats?.total || 0,
            bugs: getBugReportsForSuite(suiteName),
            duration
          };
        }
      } catch (parseError) {
        console.error(`Failed to parse test results for ${suiteName}:`, parseError);
      }
      
      return {
        suite: suiteName,
        passed: 0,
        failed: 0,
        total: 0,
        bugs: getBugReportsForSuite(suiteName),
        duration
      };
    }
  }

  function getBugReportsForSuite(suiteName: string): string[] {
    const bugReportsDir = path.join(process.cwd(), 'test-results', 'bug-reports');
    
    if (!fs.existsSync(bugReportsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(bugReportsDir);
    const bugReports: string[] = [];
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(bugReportsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const bug = JSON.parse(content);
          
          if (bug.suite === suiteName) {
            bugReports.push(file);
          }
        } catch (error) {
          console.error(`Failed to read bug report ${file}:`, error);
        }
      }
    });
    
    return bugReports;
  }

  function loadAllBugReports(): string[] {
    const bugReportsDir = path.join(process.cwd(), 'test-results', 'bug-reports');
    
    if (!fs.existsSync(bugReportsDir)) {
      return [];
    }
    
    return fs.readdirSync(bugReportsDir).filter(file => file.endsWith('.json'));
  }

  function savePartialReport(name: string, results: TestSuiteResult) {
    const reportsDir = path.join(process.cwd(), 'test-results', 'partial-reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `${name}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  }

  function loadAllPartialReports(): TestSuiteResult[] {
    const reportsDir = path.join(process.cwd(), 'test-results', 'partial-reports');
    
    if (!fs.existsSync(reportsDir)) {
      return [];
    }
    
    const files = fs.readdirSync(reportsDir);
    const reports: TestSuiteResult[] = [];
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(reportsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          reports.push(JSON.parse(content));
        } catch (error) {
          console.error(`Failed to read partial report ${file}:`, error);
        }
      }
    });
    
    return reports;
  }

  function generateRecommendations(results: TestSuiteResult[], bugs: string[]): string[] {
    const recommendations: string[] = [];
    
    const criticalSuites = results.filter(r => r.failed > 0 && 
      (r.suite.includes('Auth') || r.suite.includes('WebSocket') || r.suite.includes('Integration'))
    );
    
    if (criticalSuites.length > 0) {
      recommendations.push('CRITICAL: Fix authentication and WebSocket issues before proceeding');
      criticalSuites.forEach(suite => {
        recommendations.push(`- ${suite.suite}: ${suite.failed} failed tests`);
      });
    }
    
    if (bugs.length > 10) {
      recommendations.push('High number of bugs detected - prioritize by fix strategy priority');
    }
    
    const chatRoutingSuite = results.find(r => r.suite === 'Chat Routing Tests');
    if (chatRoutingSuite && chatRoutingSuite.failed > 5) {
      recommendations.push('Chat routing has significant issues - review intent classifier logic');
    }
    
    const voiceSuite = results.find(r => r.suite === 'Voice System Tests');
    if (voiceSuite && voiceSuite.failed > 0) {
      recommendations.push('Voice system issues detected - verify browser permissions and API');
    }
    
    return recommendations;
  }

  function generateNextSteps(results: TestSuiteResult[]): string[] {
    const steps: string[] = [];
    
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    
    if (totalFailed === 0) {
      steps.push('All tests passing! Ready for deployment.');
      steps.push('Run final smoke tests in staging environment');
      steps.push('Update documentation with test coverage');
    } else {
      steps.push(`Fix ${totalFailed} failing tests`);
      steps.push('Prioritize critical bugs (Auth, WebSocket, Integration)');
      steps.push('Review bug reports in test-results/bug-reports/');
      steps.push('Re-run orchestrator after fixes');
      steps.push('Target: 100% pass rate before deployment');
    }
    
    return steps;
  }

  function generateMarkdownSummary(report: OrchestrationReport): string {
    let md = '# MB.MD Master Test Orchestrator - Execution Summary\n\n';
    md += `**Date:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
    md += `**Overall Results:** ${report.totalPassed}/${report.totalTests} tests passing (${Math.round(report.totalPassed / report.totalTests * 100)}%)\n\n`;
    
    md += '## Test Suite Breakdown\n\n';
    md += '| Suite | Passed | Failed | Total | Pass Rate | Bugs |\n';
    md += '|-------|--------|--------|-------|-----------|------|\n';
    
    report.suiteResults.forEach(result => {
      const passRate = result.total > 0 ? Math.round(result.passed / result.total * 100) : 0;
      md += `| ${result.suite} | ${result.passed} | ${result.failed} | ${result.total} | ${passRate}% | ${result.bugs.length} |\n`;
    });
    
    md += '\n## Bug Reports\n\n';
    if (report.allBugReports.length > 0) {
      md += `Total bug reports generated: **${report.allBugReports.length}**\n\n`;
      md += 'Bug reports can be found in: `test-results/bug-reports/`\n\n';
      
      report.suiteResults.forEach(result => {
        if (result.bugs.length > 0) {
          md += `\n### ${result.suite}\n\n`;
          result.bugs.forEach(bug => {
            md += `- ${bug}\n`;
          });
        }
      });
    } else {
      md += 'No bug reports generated - all tests passing! 🎉\n\n';
    }
    
    md += '\n## Recommendations\n\n';
    report.recommendations.forEach(rec => {
      md += `- ${rec}\n`;
    });
    
    md += '\n## Next Steps\n\n';
    report.nextSteps.forEach((step, i) => {
      md += `${i + 1}. ${step}\n`;
    });
    
    md += '\n## Test Files\n\n';
    testSuites.forEach(suite => {
      md += `- **${suite.name}** (${suite.expectedTests} tests): \`${suite.file}\`\n`;
    });
    
    md += '\n## Execution Command\n\n';
    md += '```bash\n';
    md += 'npx playwright test tests/e2e/mb-md-master-orchestrator.spec.ts\n';
    md += '```\n\n';
    
    md += '## Individual Suite Commands\n\n';
    md += '```bash\n';
    testSuites.forEach(suite => {
      md += `# ${suite.name}\n`;
      md += `npx playwright test ${suite.file}\n\n`;
    });
    md += '```\n';
    
    return md;
  }
});
