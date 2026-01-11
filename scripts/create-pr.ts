// Create GitHub PR for Bug Reports Feature
// Uses Replit GitHub Integration

import { getUncachableGitHubClient } from '../server/lib/github-client';

const OWNER = 'MundoTango';
const REPO = 'Mundo-Tango';
const HEAD_BRANCH = 'feature/bug-reports';
const BASE_BRANCH = 'main';

async function listBranches() {
  console.log('📋 Listing available branches on GitHub...\n');
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: branches } = await octokit.repos.listBranches({
      owner: OWNER,
      repo: REPO,
      per_page: 50,
    });

    console.log(`Found ${branches.length} branches:`);
    branches.forEach(branch => {
      const marker = branch.name === HEAD_BRANCH ? ' ← target' : 
                    branch.name === BASE_BRANCH ? ' ← base' : '';
      console.log(`   - ${branch.name}${marker}`);
    });
    console.log('');
    
    return branches;
  } catch (error: any) {
    console.error('❌ Failed to list branches:', error.message);
    return [];
  }
}

async function checkExistingPRs() {
  console.log('🔍 Checking for existing PRs...\n');
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: prs } = await octokit.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: 20,
    });

    if (prs.length === 0) {
      console.log('   No open PRs found.\n');
      return [];
    }

    console.log(`Found ${prs.length} open PRs:`);
    prs.forEach(pr => {
      console.log(`   #${pr.number}: ${pr.title}`);
      console.log(`      ${pr.head.ref} → ${pr.base.ref}`);
      console.log(`      ${pr.html_url}\n`);
    });
    
    return prs;
  } catch (error: any) {
    console.error('❌ Failed to list PRs:', error.message);
    return [];
  }
}

async function createPullRequest(headBranch: string) {
  console.log(`🚀 Creating Pull Request from ${headBranch} to ${BASE_BRANCH}...\n`);
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    const prTitle = 'feat: Universal Bug Diagnostic System (MB.MD Pattern 67)';
    const prBody = `## Summary
Implements a comprehensive Universal Bug Diagnostic System enabling users to report bugs conversationally through Mr. Blue with interactive element targeting and journey replay.

## Features Added

### User Bug Reporting Flow
- Mr. Blue chat integration for bug reporting mode
- ElementSelector component for targeting specific DOM elements
- JourneyReplay for interactive playback of user journey
- Comprehensive diagnostic context capture (API calls, console errors, rage clicks)

### Admin Fix Flow
- Admin feedback queue at \`/admin/feedback-queue\`
- "Try Auto-Fix" button with BugFixStream SSE streaming
- ReAct protocol visualization (Analyzing → Planning → Executing → Validating)
- "Let's Fix It" VibeCoding mode with \`?mrblue=debug\` parameter
- God-level gating (tier 8+) for auto-fix capabilities

### Travel Section Integration
- New \`/api/travel/packages\` endpoint connecting events database
- New \`/api/travel/destinations\` endpoint with popular tango cities
- New \`/api/travel/trips\` endpoint for user travel plans

### Database Schema Updates
- Added \`playwright_video_url\` column to user_feedback table
- Added \`related_message_id\` column to user_feedback table
- Added \`selected_element\` column to user_feedback table

## Technical Details

### SSE Streaming Architecture
- Endpoint: \`/api/qa-platform/fix-stream/start\`
- BugDiagnosticAgent executes ReAct protocol phases
- Real-time streaming of Thought/Action/Observation markers
- BugFixStream.tsx displays agent reasoning with progress tracking

### Key Components
- \`useJourneyTracker\` hook for session activity capture
- \`DiagnosisSummary\` for AI analysis display
- \`ContextCards\` for user context and API calls
- \`JourneyTimeline\` for navigation history
- \`BugFixStream\` for real-time agent work visualization

## Testing
- E2E Playwright tests verified:
  - Admin login and navigation
  - Travel section with destinations display
  - Feedback queue with 8 pending items
  - Auto-fix dialog with "Try Auto-Fix" and "Let's Fix It" buttons

## Files Changed
- \`server/routes/travel-routes.ts\` - Added travel API endpoints
- \`server/routes/qa-platform-routes.ts\` - Bug diagnostic endpoints
- \`client/src/components/mrBlue/advanced/BugFixStream.tsx\` - SSE streaming UI
- \`client/src/pages/admin/FeedbackQueuePage.tsx\` - Admin queue with auto-fix
- \`shared/schema.ts\` - Database schema updates

## Related
- MB.MD Pattern 67: Universal Bug Diagnostic System
- Closes issues related to bug reporting and admin auto-fix capabilities
`;

    const { data: pr } = await octokit.pulls.create({
      owner: OWNER,
      repo: REPO,
      title: prTitle,
      body: prBody,
      head: headBranch,
      base: BASE_BRANCH,
    });

    console.log('✅ Pull Request Created Successfully!');
    console.log(`   PR #${pr.number}: ${pr.html_url}\n`);

    return pr;
  } catch (error: any) {
    if (error.status === 422 && error.message?.includes('already exists')) {
      console.log('ℹ️  A pull request already exists for this branch.\n');
      return null;
    }
    throw error;
  }
}

async function analyzeIssues() {
  console.log('🔍 Analyzing Open Issues...\n');
  
  try {
    const octokit = await getUncachableGitHubClient();
    
    const { data: issues } = await octokit.issues.listForRepo({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: 30,
    });

    const actualIssues = issues.filter(i => !i.pull_request);
    
    if (actualIssues.length === 0) {
      console.log('✅ No open issues found.\n');
      return [];
    }

    console.log(`📊 Found ${actualIssues.length} open issues:\n`);
    
    const bugIssues: any[] = [];
    const featureIssues: any[] = [];
    const otherIssues: any[] = [];

    actualIssues.forEach(issue => {
      const labels = issue.labels.map((l: any) => typeof l === 'string' ? l : l.name);
      
      if (labels.includes('bug') || issue.title.toLowerCase().includes('bug')) {
        bugIssues.push(issue);
      } else if (labels.includes('enhancement') || labels.includes('feature')) {
        featureIssues.push(issue);
      } else {
        otherIssues.push(issue);
      }
    });

    if (bugIssues.length > 0) {
      console.log('🐛 Bug Issues:');
      bugIssues.forEach(issue => {
        console.log(`   #${issue.number}: ${issue.title}`);
      });
      console.log('');
    }

    if (featureIssues.length > 0) {
      console.log('✨ Feature Requests:');
      featureIssues.forEach(issue => {
        console.log(`   #${issue.number}: ${issue.title}`);
      });
      console.log('');
    }

    if (otherIssues.length > 0) {
      console.log('📝 Other Issues:');
      otherIssues.slice(0, 10).forEach(issue => {
        console.log(`   #${issue.number}: ${issue.title}`);
      });
      if (otherIssues.length > 10) {
        console.log(`   ... and ${otherIssues.length - 10} more`);
      }
      console.log('');
    }

    return actualIssues;
  } catch (error: any) {
    console.error('❌ Failed to fetch issues:', error.message);
    return [];
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('  GitHub PR & Issue Analysis');
  console.log('  Universal Bug Diagnostic System (MB.MD Pattern 67)');
  console.log('='.repeat(60) + '\n');

  try {
    const branches = await listBranches();
    const branchExists = branches.some(b => b.name === HEAD_BRANCH);
    
    await checkExistingPRs();
    
    if (branchExists) {
      await createPullRequest(HEAD_BRANCH);
    } else {
      console.log(`⚠️  Branch '${HEAD_BRANCH}' not found on GitHub.`);
      console.log('   The branch may need to be pushed to the remote repository first.');
      console.log('   Available branches for PR creation listed above.\n');
      
      const replitBranch = branches.find(b => b.name === 'replit-agent');
      if (replitBranch) {
        console.log('   Attempting to create PR from replit-agent branch instead...\n');
        await createPullRequest('replit-agent');
      }
    }
    
    await analyzeIssues();
    
    console.log('='.repeat(60));
    console.log('  Analysis Complete!');
    console.log('='.repeat(60));
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main();
