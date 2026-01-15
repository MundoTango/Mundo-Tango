import { getUncachableGitHubClient } from '../server/lib/github-client';

async function checkPRStatus() {
  const octokit = await getUncachableGitHubClient();
  const owner = 'MundoTango';
  const repo = 'Mundo-Tango';
  const prNumber = 64;
  
  // Get PR details
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  console.log('PR #64 Status');
  console.log('='.repeat(40));
  console.log('State:', pr.state);
  console.log('Mergeable:', pr.mergeable);
  console.log('Mergeable State:', pr.mergeable_state);
  
  // Get checks
  try {
    const { data: checks } = await octokit.checks.listForRef({
      owner, repo,
      ref: pr.head.sha,
    });
    
    console.log('\nCI Checks:');
    if (checks.check_runs.length === 0) {
      console.log('  No checks found yet (may still be starting)');
    } else {
      checks.check_runs.forEach(check => {
        const status = check.conclusion || check.status;
        const icon = check.conclusion === 'success' ? '✅' : 
                     check.conclusion === 'failure' ? '❌' : '⏳';
        console.log(`  ${icon} ${check.name}: ${status}`);
      });
    }
  } catch (e) {
    console.log('\nCI Checks: Unable to fetch (permissions)');
  }
  
  // Get combined status
  try {
    const { data: status } = await octokit.repos.getCombinedStatusForRef({
      owner, repo,
      ref: pr.head.sha,
    });
    console.log('\nCombined Status:', status.state);
    if (status.statuses.length > 0) {
      status.statuses.forEach(s => {
        const icon = s.state === 'success' ? '✅' : s.state === 'failure' ? '❌' : '⏳';
        console.log(`  ${icon} ${s.context}: ${s.state}`);
      });
    }
  } catch (e) {
    console.log('\nCombined Status: Unable to fetch');
  }
  
  console.log('\n' + '='.repeat(40));
  if (pr.mergeable === true) {
    console.log('✅ PR can be merged!');
  } else if (pr.mergeable === null) {
    console.log('⏳ GitHub is still calculating mergeability...');
  } else {
    console.log('❌ PR has merge conflicts or issues');
  }
}

checkPRStatus().catch(console.error);
