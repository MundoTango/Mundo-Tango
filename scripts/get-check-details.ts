import { getUncachableGitHubClient } from '../server/lib/github-client';

async function getCheckDetails() {
  const octokit = await getUncachableGitHubClient();
  const owner = 'MundoTango';
  const repo = 'Mundo-Tango';
  const prNumber = 64;
  
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: prNumber });
  
  const { data: checks } = await octokit.checks.listForRef({
    owner, repo,
    ref: pr.head.sha,
  });
  
  const failedChecks = checks.check_runs.filter(c => c.conclusion === 'failure');
  
  for (const check of failedChecks) {
    console.log(`\n❌ Failed Check: ${check.name}`);
    console.log('URL:', check.html_url);
    if (check.output?.summary) {
      console.log('Summary:', check.output.summary);
    }
    if (check.output?.text) {
      console.log('Details:', check.output.text.slice(0, 500));
    }
  }
  
  // Check if all required checks passed
  const allPassed = checks.check_runs.every(c => 
    c.conclusion === 'success' || c.conclusion === 'skipped' || c.status === 'in_progress'
  );
  
  console.log('\n' + '='.repeat(40));
  if (failedChecks.length === 0) {
    console.log('All checks passed or are still running!');
  } else {
    console.log(`${failedChecks.length} check(s) failed`);
  }
}

getCheckDetails().catch(console.error);
