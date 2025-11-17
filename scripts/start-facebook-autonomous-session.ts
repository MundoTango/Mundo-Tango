/**
 * MB.MD v8.2 - AUTONOMOUS FACEBOOK INTEGRATION SESSION STARTER
 * Directly starts autonomous session to build complete FB Messenger invite system
 */

import { AutonomousEngine, AutonomousRequest } from '../server/services/mrBlue/AutonomousEngine';

async function main() {
  console.log('🤖 MB.MD v8.2 - Starting Autonomous Facebook Integration Session...\n');

  const engine = new AutonomousEngine();
  await engine.initialize();
  console.log('✅ Autonomous Engine initialized\n');

  const request: AutonomousRequest = {
    userRequest: `BUILD COMPLETE FACEBOOK MESSENGER INVITE SYSTEM:

CRITICAL REQUIREMENTS:
1. Access Facebook credentials from environment (FACEBOOK_PAGE_ACCESS_TOKEN, FACEBOOK_PAGE_ID)
2. Implement token refresh mechanism using Graph API /oauth/access_token endpoint
3. Verify pages_messaging permissions exist on current token
4. Build send_message endpoint to invite sboddye@gmail.com from admin@mundotango.life's Facebook page (@mundotango1)
5. Add rate limiting (200 calls/hour max for dev app)
6. Implement comprehensive error handling and retry logic (3 attempts with exponential backoff)
7. Add audit logging for ALL Facebook API calls (rate limits, errors, successes)
8. Create token validation service that checks token expiry every 24 hours
9. Build legal scraping fallback using Playwright if API fails (scrape FB messages as backup)
10. Test end-to-end: send actual Facebook Messenger invite to sboddye@gmail.com

FACEBOOK API SAFETY PROTOCOL (MB.MD v8.1):
- ✅ Validate token before EVERY API call using /debug_token
- ✅ Parse X-App-Usage header to track rate limits in real-time
- ✅ Throttle at 75%, pause at 90%, emergency stop at 100%
- ✅ 10-second mandatory delay after sends
- ✅ Never log tokens (use [...] placeholder in logs)
- ✅ Store tokens ONLY in environment variables (NEVER hardcode)
- ✅ Respect 24-hour messaging window (or use Tester role bypass)

SECURITY REQUIREMENTS:
- All secrets from environment variables
- No hardcoded credentials
- Zod validation on all inputs
- SQL parameterization (no string interpolation)
- CSRF protection on endpoints
- Rate limiting on public routes
- Audit logs for admin actions

TARGET OUTCOME:
Complete, production-ready Facebook Messenger invite system that can send invites from admin@mundotango.life to sboddye@gmail.com with:
- Token auto-refresh (60-day rotation)
- Rate limit compliance (<200 calls/hour)
- Error recovery (retry 3x with backoff)
- Audit trail (all API calls logged)
- Legal scraping fallback (if API blocked)
- E2E tested and validated`,
    
    userId: 1, // admin@mundotango.life
    maxCost: 15.0,
    runTests: true,
    autoApprove: false,
  };

  console.log('📋 Request Details:');
  console.log(`   User ID: ${request.userId} (admin@mundotango.life)`);
  console.log(`   Max Cost: $${request.maxCost}`);
  console.log(`   Run Tests: ${request.runTests}`);
  console.log(`   Auto Approve: ${request.autoApprove}\n`);

  console.log('🚀 Starting autonomous session (non-blocking)...\n');
  
  // Start session (runs in background)
  const sessionPromise = engine.runAutonomous(request);

  // Get decomposition immediately
  const decomposition = await engine.decomposeTask(request.userRequest);
  
  console.log('✅ Session Started!');
  console.log(`📊 Decomposition:`);
  console.log(`   Total Subtasks: ${decomposition.subtasks.length}`);
  console.log(`   Estimated Cost: $${(decomposition.subtasks.length * 0.05).toFixed(2)}`);
  console.log(`   Estimated Time: ${decomposition.estimatedTotalTime}\n`);

  console.log('📝 Subtasks:');
  decomposition.subtasks.forEach((task, idx) => {
    console.log(`   ${idx + 1}. ${task}`);
  });

  console.log('\n⏱️  Session running in background...');
  console.log('💡 Monitor progress with: GET /api/mrblue/autonomous/progress/:sessionId');
  console.log('💡 Or check autonomous_sessions table in database\n');

  // Wait for session to complete (or timeout after 10 minutes)
  console.log('⏳ Waiting for session completion (max 10 minutes)...\n');
  
  const timeout = setTimeout(() => {
    console.log('⏰ 10-minute timeout reached - session still running in background');
    process.exit(0);
  }, 600000); // 10 minutes

  try {
    const session = await sessionPromise;
    clearTimeout(timeout);
    
    console.log('\n✅ SESSION COMPLETE!');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Total Tasks: ${session.totalTasks}`);
    console.log(`   Completed: ${session.completedTasks}`);
    console.log(`   Success Rate: ${((session.completedTasks / session.totalTasks) * 100).toFixed(1)}%\n`);

    if (session.errors && session.errors.length > 0) {
      console.log('⚠️  Errors encountered:');
      session.errors.forEach(err => console.log(`   - ${err}`));
    }

    process.exit(0);
  } catch (error: any) {
    clearTimeout(timeout);
    console.error('\n❌ Session failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
