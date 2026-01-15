// Create GitHub PR for Admin Password Reset Feature
// Uses Replit GitHub Integration

import { getUncachableGitHubClient } from '../server/lib/github-client';

const OWNER = 'MundoTango';
const REPO = 'Mundo-Tango';
const HEAD_BRANCH = 'marta-bugs';
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
    
    const prTitle = 'feat(admin): add password reset functionality for admins';
    const prBody = `## Summary
Add admin password reset feature to help resolve user login issues from the Admin Users Management page.

## Changes

### API Endpoint
- \`POST /api/admin/users/:userId/reset-password\`
- Protected by RBAC (admin tier 4+ required)
- Cryptographically secure temp passwords using crypto.randomBytes
- Email notification with temporary password to user
- Fallback: displays temp password in UI if email fails

### Admin UI
- New reset button (key icon) on Admin Users page (/admin/users)
- Confirmation dialog before reset action
- Toast notification shows result (email sent or manual action needed)
- Persistent toast (60s) when email fails to ensure admin can share password

### Security
- Uses crypto.randomBytes for cryptographically secure password generation
- Audit logging for all reset actions (adminId, targetUserId, timestamp)
- Temp password only exposed in response when email delivery fails

## Files Changed
- \`server/routes/admin-routes.ts\` - Added reset-password endpoint
- \`server/services/EmailService.ts\` - Added sendPasswordResetByAdmin method
- \`client/src/pages/AdminUsersManagementPage.tsx\` - Added reset button and dialog
- \`replit.md\` - Updated documentation with new feature

## Testing
- Endpoint responds correctly with CSRF protection
- UI confirmation dialog prevents accidental resets
- Email notification with fallback for manual sharing

## Documentation
- Updated replit.md with admin password reset feature details
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
  console.log('  Admin Password Reset Feature');
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
