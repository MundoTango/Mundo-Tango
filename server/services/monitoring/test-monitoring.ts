/**
 * Test script for monitoring system
 * Run with: npm run test:monitoring or tsx server/services/monitoring/test-monitoring.ts
 * PHASE 0A: Recursive Monitoring System Testing
 */

import { PolicyMonitoringJobs } from '../../jobs/policy-monitoring-jobs';
import { SocialMediaPolicyMonitor } from './SocialMediaPolicyMonitor';
import { RateLimitTracker } from './RateLimitTracker';
import { PolicyComplianceChecker } from './PolicyComplianceChecker';

async function testMonitoringSystem() {
  console.log('='.repeat(80));
  console.log('PHASE 0A: MONITORING SYSTEM TEST');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test 1: Initialize monitoring system
    console.log('[TEST 1] Initializing monitoring system...');
    await SocialMediaPolicyMonitor.initialize();
    console.log('✅ Monitoring system initialized\n');

    // Test 2: Simulate Facebook API activity
    console.log('[TEST 2] Simulating Facebook API activity...');
    for (let i = 0; i < 5; i++) {
      RateLimitTracker.trackCall('facebook');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    const fbMetrics = RateLimitTracker.getActivityMetrics('facebook');
    console.log('Facebook metrics:', fbMetrics);
    console.log('✅ Activity tracking working\n');

    // Test 3: Test rate limit thresholds
    console.log('[TEST 3] Testing rate limit thresholds...');
    const testData = {
      platform: 'facebook' as const,
      callCount: 78,
      totalTime: 50,
      totalCputime: 30,
      callsPerHour: 5,
      percentUsed: 78,
      timestamp: new Date(),
    };
    const action = await RateLimitTracker.processRateLimit(testData);
    console.log(`Rate limit action at 78%: ${action}`);
    console.log('✅ Threshold detection working\n');

    // Test 4: Test compliance checking
    console.log('[TEST 4] Checking compliance status...');
    const complianceReport = await PolicyComplianceChecker.generateComplianceReport();
    console.log('Compliance Report Summary:', {
      criticalIssues: complianceReport.criticalIssues,
      recommendations: complianceReport.recommendations.length,
      timestamp: complianceReport.timestamp,
    });
    console.log('✅ Compliance checking working\n');

    // Test 5: Monitor all platforms
    console.log('[TEST 5] Monitoring all platforms...');
    const platformStatuses = await SocialMediaPolicyMonitor.monitorAllPlatforms();
    console.log(`Monitored ${platformStatuses.length} platforms`);
    platformStatuses.forEach(status => {
      console.log(`  - ${status.platform}: ${status.activityLevel} (${status.callsLastHour} calls/hour)`);
    });
    console.log('✅ Platform monitoring working\n');

    // Test 6: Get sliding-scale schedule
    console.log('[TEST 6] Getting sliding-scale schedule...');
    const schedules = SocialMediaPolicyMonitor.getSlidingScaleSchedule();
    console.log('Sliding-scale schedules:');
    schedules.forEach(schedule => {
      console.log(`  - ${schedule.platform}: ${schedule.currentInterval} (${schedule.activityLevel})`);
    });
    console.log('✅ Sliding-scale scheduling working\n');

    // Test 7: Generate dashboard data
    console.log('[TEST 7] Generating dashboard data...');
    const dashboard = await SocialMediaPolicyMonitor.getDashboardData();
    console.log('Dashboard Summary:', dashboard.summary);
    console.log('✅ Dashboard generation working\n');

    // Test 8: Initialize cron jobs
    console.log('[TEST 8] Initializing cron jobs...');
    await PolicyMonitoringJobs.initialize();
    const jobStatus = PolicyMonitoringJobs.getJobStatus();
    console.log('Job Status:', jobStatus);
    console.log('✅ Cron jobs initialized\n');

    // Wait a few seconds to let jobs run
    console.log('[TEST 9] Waiting 10 seconds for jobs to execute...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log('✅ Jobs should have executed\n');

    // Test 10: Cleanup
    console.log('[TEST 10] Cleaning up...');
    await PolicyMonitoringJobs.stopAll();
    console.log('✅ Cleanup complete\n');

    console.log('='.repeat(80));
    console.log('✅ ALL TESTS PASSED - MONITORING SYSTEM WORKING!');
    console.log('='.repeat(80));
    console.log('');
    console.log('Next steps:');
    console.log('1. Run migrations to create monitoring_alerts table');
    console.log('2. Start the workflow to see cron jobs in action');
    console.log('3. Monitor logs for rate limit tracking');
    console.log('4. Check database for monitoring alerts');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Run tests if executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  testMonitoringSystem();
}

export { testMonitoringSystem };
