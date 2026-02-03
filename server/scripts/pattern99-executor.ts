/**
 * PATTERN 99 EXECUTOR CLI
 * MB.MD Pattern 99 - Multi-Agent Site Auditor Bug Fix Runner
 * 
 * Usage: npx tsx server/scripts/pattern99-executor.ts [bugId]
 * 
 * This script invokes Mr. Blue's VibeCodingService to fix bugs
 * through the proper validation pipeline.
 */

import { mrBlueInternalExecutor } from '../services/MrBlueInternalExecutor';

interface TamasBug {
  id: string;
  description: string;
  targetFiles: string[];
  fixPlan: string;
  priority: 'P1' | 'P2' | 'P3';
  status: 'pending' | 'fixed' | 'in_progress';
}

const TAMAS_BUGS: TamasBug[] = [
  {
    id: 'tamas-bug-1',
    description: 'Event filtering by city not working - shows unrelated events',
    targetFiles: ['client/src/pages/CityDetailsPage.tsx'],
    fixPlan: 'Change line 1581 to pass city.city instead of city.name to fetchCityEvents',
    priority: 'P1',
    status: 'fixed',
  },
  {
    id: 'tamas-bug-2',
    description: 'RSVP status inconsistency - status resets when navigating',
    targetFiles: ['server/routes/event-routes.ts'],
    fixPlan: 'Flatten /api/events/my-rsvps response from nested {event, rsvp, organizer} to {eventId, status, event, organizer}',
    priority: 'P1',
    status: 'fixed',
  },
  {
    id: 'tamas-bug-3',
    description: 'Like/reaction persistence issue - likes not saving properly',
    targetFiles: ['server/routes/post-routes.ts', 'client/src/components/posts/PostCard.tsx'],
    fixPlan: `
1. Check if POST /api/posts/:id/like endpoint properly inserts into database
2. Verify the optimistic UI update doesn't conflict with server response
3. Check if there's a race condition or missing await
4. Ensure the like toggle logic handles duplicates correctly
`,
    priority: 'P1',
    status: 'pending',
  },
  {
    id: 'tamas-bug-4',
    description: 'DM blank screen - messages page shows blank content',
    targetFiles: ['client/src/pages/MessagesPage.tsx', 'server/routes/message-routes.ts'],
    fixPlan: `
1. Check if messages API returns data correctly
2. Verify the frontend query key matches the API endpoint
3. Check for auth issues blocking message fetch
4. Look for conditional rendering that might hide content
`,
    priority: 'P1',
    status: 'pending',
  },
  {
    id: 'tamas-bug-6',
    description: 'Friend requests stuck in pending state',
    targetFiles: ['server/routes/friend-routes.ts', 'client/src/components/friends/FriendRequestCard.tsx'],
    fixPlan: `
1. Check if accept/reject endpoint properly updates friendship status
2. Verify frontend invalidates the correct query after action
3. Check for missing status update in database
`,
    priority: 'P1',
    status: 'pending',
  },
];

async function runPattern99(bugId?: string) {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           PATTERN 99 - MR. BLUE BUG FIX EXECUTOR          ║');
  console.log('║                   MB.MD v9.9.3 Compliant                  ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const bugsToFix = bugId 
    ? TAMAS_BUGS.filter(b => b.id === bugId)
    : TAMAS_BUGS.filter(b => b.status === 'pending');

  if (bugsToFix.length === 0) {
    console.log('No pending bugs to fix (or bug ID not found).');
    console.log('\nAvailable bugs:');
    TAMAS_BUGS.forEach(b => {
      console.log(`  ${b.id}: ${b.description} [${b.status}]`);
    });
    return;
  }

  console.log(`Found ${bugsToFix.length} bug(s) to process:\n`);
  bugsToFix.forEach(b => {
    console.log(`  [${b.priority}] ${b.id}: ${b.description}`);
  });
  console.log('\n');

  for (const bug of bugsToFix) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${bug.id}`);
    console.log(`${'='.repeat(60)}\n`);

    const result = await mrBlueInternalExecutor.executeTask({
      bugId: bug.id,
      description: bug.description,
      targetFiles: bug.targetFiles,
      fixPlan: bug.fixPlan,
      userId: 2,
    });

    if (result.success) {
      console.log(`\n✅ ${bug.id} FIXED successfully!`);
      console.log(`   Files: ${result.filesModified.join(', ')}`);
    } else {
      console.log(`\n❌ ${bug.id} FAILED: ${result.error}`);
      if (result.preview?.validationResults.warnings.length) {
        console.log(`   Warnings: ${result.preview.validationResults.warnings.join(', ')}`);
      }
    }
  }

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                    EXECUTION COMPLETE                     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const logs = mrBlueInternalExecutor.getAllExecutionLogs();
  console.log('Execution Summary:');
  logs.forEach(log => {
    const status = log.success ? '✅' : '❌';
    console.log(`  ${status} ${log.bugId}: ${log.success ? 'Fixed' : log.error}`);
  });
}

const bugId = process.argv[2];
runPattern99(bugId).catch(console.error);
